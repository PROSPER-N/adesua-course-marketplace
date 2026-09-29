const AppError = require("../utils/AppError");

// Runs when no route matched. It's mounted with app.use because Express 5 rejects "*" routes.
function notFound(req, res, next) {
  next(new AppError("Route not found", 404));
}

module.exports = notFound;
