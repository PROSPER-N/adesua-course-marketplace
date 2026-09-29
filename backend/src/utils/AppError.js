// An error we expect and want the user to see, like "Course not found" (404).
// Throw it from a controller; errorHandler turns it into the standard error response.
class AppError extends Error {
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = AppError;
