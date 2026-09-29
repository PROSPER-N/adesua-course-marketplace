const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// Runs after the validator rules. If any rule failed, stop with a 400 and one message per field.
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((error) => ({
    field: error.path,
    message: error.msg,
  }));
  next(new AppError("Please fix the highlighted fields", 400, errors));
}

module.exports = validate;
