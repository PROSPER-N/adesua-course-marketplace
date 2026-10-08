const { body, param, query } = require("express-validator");

const ROLES = ["student", "instructor", "admin"];
const STATUSES = ["draft", "published"];
const REVIEW_TYPES = ["course", "site"];
const REVIEW_TYPE_MSG = "Type must be course or site.";

// Returns a new chain each time, so a change to one list's rule can't change the other's.
function pageAndLimitRule() {
  return query(["page", "limit"], "Page and limit must be positive numbers.")
    .optional({ values: "falsy" })
    .isInt({ min: 1 });
}

// GET /api/admin/users
const listUsersRules = [
  // optional({ values: "falsy" }) means an empty ?role= shows every role.
  // custom() also rejects a repeated ?role=student&role=admin, which isIn() would let through.
  query("role", "Choose a valid role.")
    .optional({ values: "falsy" })
    .custom((value) => ROLES.includes(value)),
  pageAndLimitRule(),
];

// GET /api/admin/courses
const listCoursesRules = [
  // Same as role above: an empty ?status= shows both, and a repeated one is rejected.
  query("status", "Status must be draft or published.")
    .optional({ values: "falsy" })
    .custom((value) => STATUSES.includes(value)),
  pageAndLimitRule(),
];

// PATCH /api/admin/users/:id/status
const userStatusRules = [
  // strict: only a real true or false, not "true", 1 or "yes"
  body("isActive", "isActive must be true or false.").isBoolean({ strict: true }),
];

// GET /api/admin/reviews
const listReviewsRules = [
  // An empty ?type= shows course reviews, and a repeated one is rejected.
  query("type", REVIEW_TYPE_MSG)
    .optional({ values: "falsy" })
    .custom((value) => REVIEW_TYPES.includes(value)),
  pageAndLimitRule(),
];

// PATCH /api/admin/reviews/:type/:id/visibility
const reviewVisibilityRules = [
  param("type", REVIEW_TYPE_MSG).custom((value) => REVIEW_TYPES.includes(value)),
  body("isHidden", "isHidden must be true or false.").isBoolean({ strict: true }),
];

module.exports = {
  listUsersRules,
  userStatusRules,
  listCoursesRules,
  listReviewsRules,
  reviewVisibilityRules,
  pageAndLimitRule,
};
