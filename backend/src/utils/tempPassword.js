const crypto = require("crypto");


function generateTempPassword() {
  return crypto.randomBytes(8).toString("base64url").slice(0, 10);
}

module.exports = { generateTempPassword };
