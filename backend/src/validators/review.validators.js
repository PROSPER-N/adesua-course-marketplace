const { body } = require("express-validator");
const { pageAndLimitRule } = require("./admin.validators");

// The contract's words (docs/API_CONTRACT.md, "Validation messages").
const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

// A JSON whole number from 1 to 5. Text like "4", decimals and lists are refused.
function ratingRule(field) {
  return body(field, RATING_MSG).custom(
    (value) => Number.isInteger(value) && value >= 1 && value <= 5
  );
}

function commentRule() {
  return body("comment", COMMENT_MSG).isString().trim().isLength({ min: 10, max: 1000 });
}

// GET /api/courses/:id/reviews and GET /api/reviews
const reviewListRules = [pageAndLimitRule()];

// PUT /api/courses/:id/reviews/mine
const courseReviewRules = [
  ratingRule("courseRating"),
  ratingRule("instructorRating"),
  commentRule(),
];

// PUT /api/reviews/mine
const siteReviewRules = [ratingRule("rating"), commentRule()];

module.exports = { reviewListRules, courseReviewRules, siteReviewRules };
