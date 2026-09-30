const { body, query } = require("express-validator");

const ROLES = ["student", "instructor", "admin"];

// GET /api/admin/users
const listUsersRules = [
  // optional({ values: "falsy" }) means an empty ?role= shows every role.
  // custom() also rejects a repeated ?role=student&role=admin, which isIn() would let through.
  query("role", "Choose a valid role.")
    .optional({ values: "falsy" })
    .custom((value) => ROLES.includes(value)),
  query(["page", "limit"], "Page and limit must be positive numbers.")
    .optional({ values: "falsy" })
    .isInt({ min: 1 }),
];

// PATCH /api/admin/users/:id/status
const userStatusRules = [
  // strict: only a real true or false, not "true", 1 or "yes"
  body("isActive", "isActive must be true or false.").isBoolean({ strict: true }),
];

module.exports = { listUsersRules, userStatusRules };
