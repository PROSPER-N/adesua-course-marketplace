const CourseReview = require("../models/CourseReview");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildPagination } = require("../utils/pagination");
const { findPublishedCourse, isEnrolled } = require("../services/enrollment.service");
const { recalculateCourseRating, summarize, saveReview } = require("../services/review.service");

const NOT_ENROLLED = "Enroll in this course to review it.";

// GET /api/courses/:id/reviews
const getCourseReviews = asyncHandler(async (req, res) => {
  // A draft gets the same 404 as a course that doesn't exist.
  const course = await findPublishedCourse(req.params.id);
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = { course: course._id, isHidden: false };

  const [items, total, summary] = await Promise.all([
    CourseReview.find(filter)
      .select("user courseRating instructorRating comment createdAt updatedAt")
      .populate("user", "name")
      // _id breaks ties between reviews saved in the same millisecond, so pages never overlap
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CourseReview.countDocuments(filter),
    summarize(CourseReview, filter, "courseRating"),
  ]);

  sendSuccess(res, {
    message: "Reviews fetched successfully",
    data: { items, pagination: buildPagination(page, limit, total), summary },
  });
});

// GET /api/courses/:id/reviews/mine
const getMyCourseReview = asyncHandler(async (req, res) => {
  const course = await findPublishedCourse(req.params.id);
  // Includes isHidden, so the student can see that an admin hid it.
  const review = await CourseReview.findOne({ user: req.user._id, course: course._id });

  sendSuccess(res, { message: "Review fetched successfully", data: review });
});

// PUT /api/courses/:id/reviews/mine
const saveMyCourseReview = asyncHandler(async (req, res) => {
  const course = await findPublishedCourse(req.params.id);
  if (!(await isEnrolled(req.user._id, course._id))) {
    throw new AppError(NOT_ENROLLED, 403);
  }

  const { courseRating, instructorRating, comment } = req.body;
  // Editing never changes isHidden, so a review an admin hid stays hidden.
  const { review, created } = await saveReview(
    CourseReview,
    { user: req.user._id, course: course._id },
    { courseRating, instructorRating, comment }
  );
  await recalculateCourseRating(course._id);

  sendSuccess(res, {
    statusCode: created ? 201 : 200,
    message: created ? "Review created successfully" : "Review updated successfully",
    data: review,
  });
});

// DELETE /api/courses/:id/reviews/mine
const deleteMyCourseReview = asyncHandler(async (req, res) => {
  const course = await findPublishedCourse(req.params.id);
  const review = await CourseReview.findOneAndDelete({ user: req.user._id, course: course._id });
  if (!review) {
    throw new AppError("Review not found", 404);
  }
  await recalculateCourseRating(course._id);

  sendSuccess(res, { message: "Review deleted successfully" });
});

module.exports = { getCourseReviews, getMyCourseReview, saveMyCourseReview, deleteMyCourseReview };
