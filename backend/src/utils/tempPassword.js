const crypto = require("crypto");

/**
 * Generates a secure random temp password: 10 chars, alphanumeric
 */
function generateTempPassword() {
  return crypto.randomBytes(8).toString("base64url").slice(0, 10);
}

module.exports = { generateTempPassword };
