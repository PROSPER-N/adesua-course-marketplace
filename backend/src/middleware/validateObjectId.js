const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

// validateObjectId() checks req.params.id; validateObjectId("courseId", "lessonId") checks those.
// Bad IDs are stopped here with a 400, before any database call.
function validateObjectId(...paramNames) {
  const names = paramNames.length > 0 ? paramNames : ["id"];

  return (req, res, next) => {
    // isObjectIdOrHexString only accepts a real 24-character ID.
    const allValid = names.every((name) => mongoose.isObjectIdOrHexString(req.params[name]));
    if (!allValid) return next(new AppError("Invalid ID", 400));
    next();
  };
}

module.exports = validateObjectId;
