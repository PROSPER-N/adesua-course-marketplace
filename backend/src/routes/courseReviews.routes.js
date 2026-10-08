// Owner: Member A
// Endpoints:
//   GET    /api/courses/:id/reviews        Public    Visible reviews of a published course, with a summary
//   GET    /api/courses/:id/reviews/mine   Student   My review of the course, or null
//   PUT    /api/courses/:id/reviews/mine   Student   Create or update my review (enrolled students only)
//   DELETE /api/courses/:id/reviews/mine   Student   Delete my review

// courses.routes.js (Member B) and learning.routes.js (Member C) are also mounted at /api/courses.
// Put protect/authorize on each route here, not router.use(), or it would affect their routes too.

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { reviewListRules, courseReviewRules } = require("../validators/review.validators");
const {
  getCourseReviews,
  getMyCourseReview,
  saveMyCourseReview,
  deleteMyCourseReview,
} = require("../controllers/courseReview.controller");

const router = express.Router();

router.get("/:id/reviews", validateObjectId(), reviewListRules, validate, getCourseReviews);
router.get(
  "/:id/reviews/mine",
  validateObjectId(),
  protect,
  authorize("student"),
  getMyCourseReview
);
router.put(
  "/:id/reviews/mine",
  validateObjectId(),
  protect,
  authorize("student"),
  courseReviewRules,
  validate,
  saveMyCourseReview
);
// DELETE has no body, so validateObjectId is its only check.
router.delete(
  "/:id/reviews/mine",
  validateObjectId(),
  protect,
  authorize("student"),
  deleteMyCourseReview
);

module.exports = router;
