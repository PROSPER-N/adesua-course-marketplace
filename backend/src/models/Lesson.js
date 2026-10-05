const mongoose = require("mongoose");

const TITLE_MSG = "Lesson title must be between 3 and 120 characters.";
const DURATION_MSG = "Enter the length in minutes (1 to 300).";
const ORDER_MSG = "Lesson order must be a whole number of 1 or more.";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, TITLE_MSG],
      trim: true,
      minlength: [3, TITLE_MSG],
      maxlength: [120, TITLE_MSG],
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // The lesson notes.
    content: {
      type: String,
      default: "",
    },
    // min and max allow 1.5, so Number.isInteger rejects parts of a minute.
    durationMinutes: {
      type: Number,
      required: [true, DURATION_MSG],
      min: [1, DURATION_MSG],
      max: [300, DURATION_MSG],
      validate: { validator: Number.isInteger, message: DURATION_MSG },
    },
    order: {
      type: Number,
      required: [true, ORDER_MSG],
      min: [1, ORDER_MSG],
      validate: { validator: Number.isInteger, message: ORDER_MSG },
    },
    // Preview lessons show their video and notes on the public course page, before enrolling.
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// A course's lessons are always loaded in order.
lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
