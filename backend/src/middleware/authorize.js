const AppError = require("../utils/AppError");

// Use after protect, e.g. authorize("admin") or authorize("instructor", "admin").
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to do that", 403));
    }
    next();
  };
}

module.exports = authorize;
