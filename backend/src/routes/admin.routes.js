// Owner: Member A
// Endpoints:
//   GET   /api/admin/stats              Admin   Platform totals
//   GET   /api/admin/users              Admin   Users with search, role filter, pagination
//   PATCH /api/admin/users/:id/status   Admin   Deactivate or reactivate { isActive }
//   GET   /api/admin/courses            Admin   All courses including drafts
//   GET   /api/admin/reviews            Admin   Course or platform reviews, hidden ones included
//   PATCH /api/admin/reviews/:type/:id/visibility   Admin   Hide or show a review { isHidden }

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const {
  listUsersRules,
  userStatusRules,
  listCoursesRules,
  listReviewsRules,
  reviewVisibilityRules,
} = require("../validators/admin.validators");
const {
  getStats,
  listUsers,
  updateUserStatus,
  listCourses,
  listReviews,
  updateReviewVisibility,
} = require("../controllers/admin.controller");

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
router.get("/courses", protect, authorize("admin"), listCoursesRules, validate, listCourses);
router.get("/reviews", protect, authorize("admin"), listReviewsRules, validate, listReviews);
router.patch(
  "/reviews/:type/:id/visibility",
  validateObjectId(),
  protect,
  authorize("admin"),
  reviewVisibilityRules,
  validate,
  updateReviewVisibility
);

module.exports = router;
