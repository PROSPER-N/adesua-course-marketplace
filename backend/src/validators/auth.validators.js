const { body } = require("express-validator");

const NAME_MSG = "Name must be between 2 and 50 characters.";
const EMAIL_MSG = "Enter a valid email address.";
const PASSWORD_MSG = "Password must be at least 8 characters and include a letter and a number.";
const ROLE_MSG = "Choose to learn or to teach.";

// body(field, message) gives every check in that chain the same message.
// isString() comes first so arrays and objects (like { "$gt": "" }) are rejected.

const registerRules = [
  body("name", NAME_MSG).isString().trim().isLength({ min: 2, max: 50 }),
  body("email", EMAIL_MSG).isString().trim().toLowerCase().isEmail(),
  body("password", PASSWORD_MSG)
    .isString()
    .isLength({ min: 8 })
    .matches(/[A-Za-z]/) // at least one letter
    .matches(/\d/), // at least one number
  // "admin" is not in the list, so sign-up can never create an admin.
  body("role", ROLE_MSG).optional().isIn(["student", "instructor"]),
];

const loginRules = [
  body("email", EMAIL_MSG).isString().trim().toLowerCase().isEmail(),
  body("password", "Enter your password.").isString().notEmpty(),
];

module.exports = { registerRules, loginRules };
