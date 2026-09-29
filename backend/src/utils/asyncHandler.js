// Wraps an async controller so any error it throws reaches errorHandler.
// Express 5 already does this on its own; we keep it so every controller looks the same.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
