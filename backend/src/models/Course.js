const mongoose = require("mongoose");

const TITLE_MSG = "Title must be between 5 and 120 characters.";
const SHORT_DESCRIPTION_MSG = "Keep the short description under 160 characters.";
const DESCRIPTION_MSG = "Description must be at least 20 characters.";
const LEARN_MSG = "List up to 6 things students will learn.";
const PRICE_MIN_MSG = "Price can't be negative. Enter 0 for a free course.";
const PRICE_MAX_MSG = "Price can't be more than 5,000.";
const LEVEL_MSG = "Choose a level.";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, TITLE_MSG],
      trim: true,
      minlength: [5, TITLE_MSG],
      maxlength: [120, TITLE_MSG],
    },
    shortDescription: {
      type: String,
      required: [true, SHORT_DESCRIPTION_MSG],
      trim: true,
      maxlength: [160, SHORT_DESCRIPTION_MSG],
    },
    description: {
      type: String,
      required: [true, DESCRIPTION_MSG],
      trim: true,
      minlength: [20, DESCRIPTION_MSG],
    },
    whatYouWillLearn: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (items) => items.length <= 6,
        message: LEARN_MSG,
      },
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Choose a valid category."],
    },
    price: {
      type: Number,
      required: [true, PRICE_MIN_MSG],
      min: [0, PRICE_MIN_MSG],
      max: [5000, PRICE_MAX_MSG],
    },
    level: {
      type: String,
      required: [true, LEVEL_MSG],
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: LEVEL_MSG,
      },
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // stats.service.js counts published courses by this exact value.
    status: {
      type: String,
      enum: {
        values: ["draft", "published"],
        message: "Status must be draft or published.",
      },
      default: "draft",
    },
    // Stored on the course, so course lists don't have to count lessons and students every time.
    lessonCount: {
      type: Number,
      default: 0,
    },
    totalMinutes: {
      type: Number,
      default: 0,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    // The course's rating from its visible reviews, rounded to 1 decimal. review.service.js
    // updates both whenever a review is created, updated, deleted, hidden or shown.
    ratingAverage: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// The public course list shows published courses, often filtered by category.
courseSchema.index({ status: 1, category: 1 });
// Instructors load their own courses on their dashboard.
courseSchema.index({ instructor: 1 });

module.exports = mongoose.model("Course", courseSchema);
