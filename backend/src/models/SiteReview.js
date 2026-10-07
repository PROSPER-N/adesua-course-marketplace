const mongoose = require("mongoose");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

// A review of Adesua itself, shown on the public Reviews page.
const siteReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Whole stars only, from 1 to 5.
    rating: {
      type: Number,
      required: [true, RATING_MSG],
      min: [1, RATING_MSG],
      max: [5, RATING_MSG],
      validate: { validator: Number.isInteger, message: RATING_MSG },
    },
    comment: {
      type: String,
      required: [true, COMMENT_MSG],
      trim: true,
      minlength: [10, COMMENT_MSG],
      maxlength: [1000, COMMENT_MSG],
    },
    // Set by an admin. A hidden review is left out of the public list and the average.
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One platform review per account.
siteReviewSchema.index({ user: 1 }, { unique: true });
// The public list: visible reviews, newest first.
siteReviewSchema.index({ isHidden: 1, createdAt: -1 });

module.exports = mongoose.model("SiteReview", siteReviewSchema);
