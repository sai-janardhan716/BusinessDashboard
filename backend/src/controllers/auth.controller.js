require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateTempPassword } = require("../utils/tempPassword");
const { sendWelcomeEmail } = require("../utils/email");

// ─── Role mapping: executive title → { role_id, sector } ───────────────────
const OFFICER_ROLES = {
  CTO: { role_id: 6, sector: "Tech" },
  CFO: { role_id: 2, sector: "Finance" },
  CMO: { role_id: 4, sector: "Marketing" },
  CCO: { role_id: 7, sector: "Compliance" },
  "Head of Sales": { role_id: 5, sector: "Sales" },
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/founder-register
// Body: { founderName, founderEmail, password, companyName, foundedDate, officers: [{title, name, email}] }
// ─────────────────────────────────────────────────────────────────────────────
exports.founderRegister = async (req, res) => {
  const { founderName, founderEmail, password, officers = [] } = req.body;

  if (!founderName || !founderEmail || !password) {
    return res.status(400).json({ message: "Founder name, email and password are required." });
  }

  try {
    // Check founder email uniqueness
    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [founderEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Create founder account (role_id=1, sector=null, status=active)
    const founderHash = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (name, email, password_hash, role_id, sector, status) VALUES (?, ?, ?, 1, NULL, 'active')",
      [founderName, founderEmail, founderHash]
    );

    // Create each selected officer
    const emailResults = [];
    for (const officer of officers) {
      const { title, name, email } = officer;

      if (!title || !name || !email) continue;

      const roleInfo = OFFICER_ROLES[title];
      if (!roleInfo) {
        emailResults.push({ email, status: "skipped", reason: `Unknown role: ${title}` });
        continue;
      }

      // Check officer email uniqueness
      const [existingOfficer] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
      if (existingOfficer.length > 0) {
        emailResults.push({ email, status: "skipped", reason: "Email already in use" });
        continue;
      }

      const tempPass = generateTempPassword();
      const tempHash = await bcrypt.hash(tempPass, 10);

      await db.execute(
        "INSERT INTO users (name, email, password_hash, role_id, sector, status) VALUES (?, ?, ?, ?, ?, 'pending_reset')",
        [name, email, tempHash, roleInfo.role_id, roleInfo.sector]
      );

      // Send welcome email — non-blocking failure (log but don't abort)
      try {
        await sendWelcomeEmail(name, email, tempPass);
        emailResults.push({ email, status: "sent" });
      } catch (emailErr) {
        console.error(`Email failed for ${email}:`, emailErr.message);
        emailResults.push({ email, status: "email_failed", reason: emailErr.message });
      }
    }

    res.status(201).json({
      message: "Company registered successfully.",
      emailResults,
    });
  } catch (err) {
    console.error("founderRegister error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// Response: { token, user } OR { requiresReset: true, email }
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.password_hash, u.status, u.sector,
              r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    if (user.status === "disabled") {
      return res.status(403).json({ message: "Your account has been disabled. Contact your Founder." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Officer must reset before accessing dashboard
    if (user.status === "pending_reset") {
      return res.json({
        requiresReset: true,
        email: user.email,
        message: "You must reset your password before continuing.",
      });
    }

    // Issue JWT for active users
    const token = jwt.sign(
      { id: user.id, role: user.role, sector: user.sector },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        sector: user.sector,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { email, currentPassword, newPassword }
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.password_hash, u.status, r.name AS role, u.sector
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.execute(
      "UPDATE users SET password_hash = ?, status = 'active' WHERE email = ?",
      [newHash, email]
    );

    // Issue a JWT so the user is logged in immediately after reset
    const token = jwt.sign(
      { id: user.id, role: user.role, sector: user.sector },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Password reset successfully. You are now logged in.",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        sector: user.sector,
      },
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT u.id, u.name, u.email, u.sector, u.status, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.id`
    );
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Server error." });
  }
};