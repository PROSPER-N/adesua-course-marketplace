const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const {
  ALREADY_ENROLLED,
  NOT_ENROLLED,
  findPublishedCourse,
  isEnrolled,
  enrollStudent,
  calculateProgress,
} = require("../services/enrollment.service");

// POST /api/enrollments
const enroll = asyncHandler(async (req, res) => {
  const course = await findPublishedCourse(req.body.courseId);

  if (course.price > 0) {
    throw new AppError("This course is paid. Go to checkout.", 400);
  }
  if (await isEnrolled(req.user._id, course._id)) {
    throw new AppError(ALREADY_ENROLLED, 409);
  }

  const enrollment = await enrollStudent({ user: req.user._id, course: course._id });

  sendSuccess(res, { statusCode: 201, message: "Enrolled successfully", data: enrollment });
});

// GET /api/enrollments/my
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id })
    .select("course completedLessons progress completedAt createdAt")
    .populate({
      path: "course",
      select: "title thumbnailUrl lessonCount category instructor",
      populate: [
        { path: "category", select: "name slug" },
        { path: "instructor", select: "name -_id" },
      ],
    })
    // _id breaks ties between enrollments made in the same millisecond
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  sendSuccess(res, { message: "Enrollments fetched successfully", data: enrollments });
});

// PATCH /api/enrollments/:courseId/lessons/:lessonId/complete
const completeLesson = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  const course = await Course.findById(courseId).select("lessonCount");
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  if (!(await isEnrolled(req.user._id, course._id))) {
    throw new AppError(NOT_ENROLLED, 403);
  }
  // The lesson must belong to this course, not just exist.
  if (!(await Lesson.exists({ _id: lessonId, course: course._id }))) {
    throw new AppError("Lesson not found", 404);
  }

  // $addToSet adds the lesson only once, so completing it again changes nothing.
  const enrollment = await Enrollment.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    { $addToSet: { completedLessons: lessonId } },
    { returnDocument: "after" }
  );

  enrollment.progress = calculateProgress(enrollment.completedLessons.length, course.lessonCount);
  if (enrollment.progress === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }
  await enrollment.save();

  const { completedLessons, progress, completedAt } = enrollment;
  sendSuccess(res, {
    message: "Lesson marked as complete",
    data: { completedLessons, progress, completedAt },
  });
});

module.exports = { enroll, getMyEnrollments, completeLesson };
