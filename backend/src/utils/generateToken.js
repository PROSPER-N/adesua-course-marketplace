const jwt = require("jsonwebtoken");

function generateToken(userId) {
  // String() turns a MongoDB ObjectId into plain text for the token.
  return jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = generateToken;
