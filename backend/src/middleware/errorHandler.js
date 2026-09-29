const AppError = require("../utils/AppError");

const SESSION_EXPIRED = "Your session has expired. Please log in again.";
const JWT_ERRORS = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];

// Works out the status code, message and field errors for any kind of error.
function describeError(err) {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, errors: err.errors };
  }

  // express.json() couldn't read the request body
  if (err.type === "entity.parse.failed") {
    return { statusCode: 400, message: "The request body isn't valid JSON." };
  }
  if (err.type === "entity.too.large") {
    return { statusCode: 413, message: "The request body is too large." };
  }

  // Mongoose couldn't turn a value into the right type, usually a bad ID
  if (err.name === "CastError") {
    return { statusCode: 400, message: "Invalid ID" };
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));
    return { statusCode: 400, message: "Please fix the highlighted fields", errors };
  }

  // MongoDB duplicate key: a unique field (like email) already has this value
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message =
      field === "email" ? "An account with this email already exists" : `${field} already exists`;
    return { statusCode: 409, message };
  }

  if (JWT_ERRORS.includes(err.name)) {
    return { statusCode: 401, message: SESSION_EXPIRED };
  }

  return { statusCode: 500, message: "Something went wrong on our side. Please try again." };
}

// Express knows this is the error handler because it takes 4 arguments, so keep "next".
function errorHandler(err, req, res, next) {
  const { statusCode, message, errors } = describeError(err);

  if (process.env.NODE_ENV !== "test") {
    if (statusCode >= 500) {
      console.error(err); // full error with stack trace, for us only
    } else {
      console.warn(`${statusCode} ${req.method} ${req.originalUrl}: ${message}`);
    }
  }

  // Never send err.stack to the client.
  const body = { success: false, message, data: null };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
}

module.exports = errorHandler;
