const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const SESSION_EXPIRED = "Your session has expired. Please log in again.";

// Only lets logged-in, active users through, and puts the user on req.user.
const protect = asyncHandler(async (req, res, next) => {
  // The header looks like "Authorization: Bearer <token>"
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError("Please log in to continue", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(SESSION_EXPIRED, 401); // the token is fake, broken or expired
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(SESSION_EXPIRED, 401); // the account was deleted after the token was made
  }
  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  req.user = user;
  next();
});

module.exports = protect;
