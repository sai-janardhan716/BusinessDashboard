const jwt = require("jsonwebtoken");
exports.signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      sector: user.sector
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);