const rateLimit = require("express-rate-limit");

// Slows down password guessing: 20 sign-up or login attempts per 15 minutes per IP.
// Used only on register and login (not /me, which the frontend calls on every page load).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Tests send many requests quickly, so they must never get a 429.
  skip: () => process.env.NODE_ENV === "test",
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again in 15 minutes.",
      data: null,
    });
  },
});

module.exports = { authLimiter };
