// Owner: Member A
// Mounted at /api/auth. Endpoints (see docs/API_CONTRACT.md):
//   POST /api/auth/register   Public      Create a student or instructor account
//   POST /api/auth/login      Public      Log in
//   GET  /api/auth/me         Logged in   Current user

const express = require("express");
const protect = require("../middleware/protect");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimit");
const { registerRules, loginRules } = require("../validators/auth.validators");
const { register, login, getMe } = require("../controllers/auth.controller");

const router = express.Router();

// The rate limiter runs first, so failed and invalid attempts count too.
router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.get("/me", protect, getMe);

module.exports = router;
