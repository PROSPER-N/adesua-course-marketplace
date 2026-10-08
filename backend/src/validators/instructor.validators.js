const { pageAndLimitRule } = require("./admin.validators");

// GET /api/instructors
const instructorListRules = [pageAndLimitRule()];

module.exports = { instructorListRules };
