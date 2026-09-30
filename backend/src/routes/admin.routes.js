// Owner: Member A
// Endpoints:
//   GET   /api/admin/stats              Admin   Platform totals
//   GET   /api/admin/users              Admin   Users with search, role filter, pagination
//   PATCH /api/admin/users/:id/status   Admin   Deactivate or reactivate { isActive }
//   GET   /api/admin/courses            Admin   All courses including drafts

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { listUsersRules, userStatusRules } = require("../validators/admin.validators");
const { getStats, listUsers, updateUserStatus } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/stats", protect, authorize("admin"), getStats);
router.get("/users", protect, authorize("admin"), listUsersRules, validate, listUsers);
router.patch(
  "/users/:id/status",
  validateObjectId(),
  protect,
  authorize("admin"),
  userStatusRules,
  validate,
  updateUserStatus
);

// TODO (Member A): GET /courses comes in a later task, once Member C's Course model is merged.

module.exports = router;
