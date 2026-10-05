const { body } = require("express-validator");

// POST /api/enrollments
// isString() comes first, so arrays and objects like { "$gt": "" } are rejected.
const enrollRules = [body("courseId", "Invalid ID").isString().isMongoId()];

module.exports = { enrollRules };
