const Enrollment = require("../models/Enrollment");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const {
  ALREADY_ENROLLED,
  findPublishedCourse,
  isEnrolled,
  enrollStudent,
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

module.exports = { enroll, getMyEnrollments };
