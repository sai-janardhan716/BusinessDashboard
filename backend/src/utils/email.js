const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a welcome email to a newly created officer.
 * @param {string} name - Officer's name
 * @param {string} email - Officer's email
 * @param {string} tempPassword - Plain-text temporary password
 */
async function sendWelcomeEmail(name, email, tempPassword) {
  const mailOptions = {
    from: `"StartupOps" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "StartupOps Account Created",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; 
                  background: #0f172a; color: #e2e8f0; padding: 30px; border-radius: 12px;">
        <h2 style="color: #6366f1; margin-bottom: 4px;">StartupOps</h2>
        <p style="color: #94a3b8; margin-top: 0; margin-bottom: 24px;">You're now part of the team.</p>
        
        <p>Hello <strong>${name}</strong>,</p>
        <p>You were added to <strong>StartupOps</strong> by your Founder. Your login credentials are below.</p>

        <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin: 6px 0;"><strong>Temporary Password:</strong> 
            <span style="font-family: monospace; color: #6366f1;">${tempPassword}</span>
          </p>
        </div>

        <p style="color: #f87171;">
          ⚠️ You must reset your password within <strong>24 hours</strong> of receiving this email.
        </p>

        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          If you did not expect this email, please contact your company founder.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail };
