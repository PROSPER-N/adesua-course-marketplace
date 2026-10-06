const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { NOT_ENROLLED, calculateProgress } = require("../services/enrollment.service");

// GET /api/courses/:id/lessons
// Full lessons (videos and notes) for enrolled students, the course's instructor and admins.
const getCourseLessons = asyncHandler(async (req, res) => {
  // Any status: instructors preview their drafts, and enrolled students keep their lessons
  // if a course is unpublished later.
  const course = await Course.findById(req.params.id).select("title lessonCount instructor");
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwner = String(course.instructor) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  // The owner and admins aren't enrolled, so they have no progress.
  let enrollment = null;
  if (!isOwner && !isAdmin) {
    const found = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (!found) {
      throw new AppError(NOT_ENROLLED, 403);
    }
    enrollment = {
      completedLessons: found.completedLessons,
      // Worked out from the current lessonCount, so it stays right after lessons are added or deleted.
      progress: calculateProgress(found.completedLessons.length, course.lessonCount),
    };
  }

  const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });

  sendSuccess(res, {
    message: "Lessons fetched successfully",
    data: {
      course: { _id: course._id, title: course.title, lessonCount: course.lessonCount },
      lessons,
      enrollment,
    },
  });
});

module.exports = { getCourseLessons };
