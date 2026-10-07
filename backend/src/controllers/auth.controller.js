const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const { sendSuccess } = require("../utils/apiResponse");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  // Take only these fields, so nobody can send isActive or other fields in the body.
  const { name, email, password, role = "student" } = req.body;
  // Each role saves only its own profile fields. The other role's fields are ignored.
  const profile =
    role === "instructor"
      ? { headline: req.body.headline, teachingArea: req.body.teachingArea }
      : { interests: req.body.interests ?? [] };

  // If the email is taken, MongoDB throws a duplicate key error and errorHandler sends 409.
  const user = await User.create({ name, email, password, role, ...profile });

  sendSuccess(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: { token: generateToken(user._id), user },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  // Same message for a wrong email and a wrong password, so nobody can find out who has an account.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  // Checked after the password, so only the real owner learns the account is deactivated.
  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  sendSuccess(res, {
    message: "Logged in successfully",
    data: { token: generateToken(user._id), user },
  });
});

// GET /api/auth/me (protect has already loaded the user)
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: "Current user", data: { user: req.user } });
});

module.exports = { register, login, getMe };
