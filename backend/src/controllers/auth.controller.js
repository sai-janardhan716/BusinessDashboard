require("dotenv").config();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ─── Utility: generate random temporary password ────────────────────────────
function generateTempPassword(length = 10) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

// ─── Valid officer roles ────────────────────────────────────────────────────
const VALID_ROLES = ["Finance", "HR", "Marketing", "Sales", "Tech", "Compliance"];

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/auth/founder-register
// Body: { company_name, founded_date, founder_name, founder_email, password,
//         officers: { "Finance": "email", "HR": "email", ... } }
// ═════════════════════════════════════════════════════════════════════════════
exports.founderRegister = async (req, res) => {
  const {
    company_name,
    founded_date,
    founder_name,
    founder_email,
    password,
    officers = {},
  } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────
  if (!company_name || !founder_name || !founder_email || !password) {
    return res.status(400).json({
      success: false,
      message: "company_name, founder_name, founder_email and password are required.",
    });
  }

  // Get a dedicated connection for transaction
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check if founder email already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [founder_email]
    );
    if (existingUsers.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 2. Insert company
    const [companyResult] = await connection.execute(
      "INSERT INTO companies (name, founded_date) VALUES (?, ?)",
      [company_name, founded_date || null]
    );
    const company_id = companyResult.insertId;

    // 3. Hash founder password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert founder user
    const [founderResult] = await connection.execute(
      `INSERT INTO users (name, email, password, role, company_id, requires_reset)
       VALUES (?, ?, ?, 'Founder', ?, false)`,
      [founder_name, founder_email, hashedPassword, company_id]
    );
    const founder_id = founderResult.insertId;

    // 5. Insert officer users (if provided)
    for (const [role, email] of Object.entries(officers)) {
      // Skip null/empty emails and invalid roles
      if (!email || !VALID_ROLES.includes(role)) continue;

      // Generate temporary password
      const tempPassword = generateTempPassword();
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

      await connection.execute(
        `INSERT INTO users (name, email, password, role, company_id, requires_reset)
         VALUES (?, ?, ?, ?, ?, true)`,
        [`${role} Officer`, email, hashedTempPassword, role, company_id]
      );
    }

    // 6. Commit transaction
    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      company_id,
      founder_id,
    });
  } catch (err) {
    // Rollback on any error
    await connection.rollback();
    connection.release();
    console.error("founderRegister error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// Body: { email, password }
// Response: { token, user } OR { requiresReset: true, email }
// ═════════════════════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.requires_reset,
              u.company_id, c.name AS company_name
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Officer must reset password before accessing dashboard
    if (user.requires_reset) {
      return res.json({
        requiresReset: true,
        email: user.email,
        message: "You must reset your password before continuing.",
      });
    }

    // Issue JWT for active users
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        company_name: user.company_name || "My Company",
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/auth/reset-password
// Body: { email, currentPassword, newPassword }
// ═════════════════════════════════════════════════════════════════════════════
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
      `SELECT u.id, u.name, u.password, u.role, u.company_id,
              c.name AS company_name
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.execute(
      "UPDATE users SET password = ?, requires_reset = false WHERE email = ?",
      [newHash, email]
    );

    // Issue a JWT so the user is logged in immediately after reset
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
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
        company_name: user.company_name || "My Company",
      },
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error during password reset." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/auth/users  (protected)
// ═════════════════════════════════════════════════════════════════════════════
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT u.id, u.name, u.email, u.role, u.requires_reset, u.company_id,
              c.name AS company_name
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       ORDER BY u.id`
    );
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Server error." });
  }
};