const mongoose = require("mongoose");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

// Whole stars only, from 1 to 5.
function ratingField() {
  return {
    type: Number,
    required: [true, RATING_MSG],
    min: [1, RATING_MSG],
    max: [5, RATING_MSG],
    validate: { validator: Number.isInteger, message: RATING_MSG },
  };
}

const courseReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseRating: ratingField(),
    instructorRating: ratingField(),
    comment: {
      type: String,
      required: [true, COMMENT_MSG],
      trim: true,
      minlength: [10, COMMENT_MSG],
      maxlength: [1000, COMMENT_MSG],
    },
    // Set by an admin. A hidden review is left out of public lists and every average.
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One review per student per course. The database enforces it, so two quick saves can't make two.
courseReviewSchema.index({ user: 1, course: 1 }, { unique: true });
// A course's public list: its visible reviews, newest first.
courseReviewSchema.index({ course: 1, isHidden: 1, createdAt: -1 });

module.exports = mongoose.model("CourseReview", courseReviewSchema);
