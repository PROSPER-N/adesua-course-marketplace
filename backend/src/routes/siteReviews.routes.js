// Owner: Member A
// Endpoints:
//   GET    /api/reviews        Public                  Visible platform reviews, with a summary
//   GET    /api/reviews/mine   Student or instructor   My platform review, or null
//   PUT    /api/reviews/mine   Student or instructor   Create or update my platform review
//   DELETE /api/reviews/mine   Student or instructor   Delete my platform review

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { reviewListRules, siteReviewRules } = require("../validators/review.validators");
const {
  getSiteReviews,
  getMySiteReview,
  saveMySiteReview,
  deleteMySiteReview,
} = require("../controllers/siteReview.controller");

const router = express.Router();

// Admins moderate reviews, so they can't write one.
const reviewers = authorize("student", "instructor");

router.get("/", reviewListRules, validate, getSiteReviews);
router.get("/mine", protect, reviewers, getMySiteReview);
router.put("/mine", protect, reviewers, siteReviewRules, validate, saveMySiteReview);
router.delete("/mine", protect, reviewers, deleteMySiteReview);

module.exports = router;
