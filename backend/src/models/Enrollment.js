const mongoose = require("mongoose");

const PROGRESS_MSG = "Progress must be between 0 and 100.";

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Course and Lesson are referred to by name only, so this works before those models are merged.
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Stays null for free courses; set to the paid order for bought courses.
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    progress: {
      type: Number,
      min: [0, PROGRESS_MSG],
      max: [100, PROGRESS_MSG],
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One enrollment per student per course. The database enforces this,
// so two quick clicks on "Enroll" can't create two enrollments.
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
