const User = require("../models/User");
const Course = require("../models/Course");
const CourseReview = require("../models/CourseReview");
const SiteReview = require("../models/SiteReview");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const escapeRegex = require("../utils/escapeRegex");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildPagination } = require("../utils/pagination");
const { getPlatformTotals } = require("../services/stats.service");
const { recalculateCourseRating } = require("../services/review.service");

// The fields of each item in GET /api/admin/courses, as listed in docs/API_CONTRACT.md.
const ADMIN_COURSE_FIELDS =
  "title status price level lessonCount studentCount createdAt thumbnailUrl category instructor";

// The two kinds of review an admin moderates, with the fields of each item in GET /api/admin/reviews.
const REVIEW_TYPES = {
  course: {
    Model: CourseReview,
    fields: "user course courseRating instructorRating comment isHidden createdAt updatedAt",
  },
  site: {
    Model: SiteReview,
    fields: "user rating comment isHidden createdAt updatedAt",
  },
};

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [users, totals] = await Promise.all([User.countDocuments(), getPlatformTotals()]);

  sendSuccess(res, { message: "Stats fetched successfully", data: { users, ...totals } });
});

// GET /api/admin/users?search=&role=&page=&limit=
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);

  const filter = {};

  // A repeated ?search= arrives as an array, so only use it when it's text.
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  // listUsersRules has already checked that role is one of the three roles.
  if (req.query.role) {
    filter.role = req.query.role;
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("name email role isActive createdAt")
      // _id breaks ties between users created in the same millisecond, so pages never overlap
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message: "Users fetched successfully",
    data: { items, pagination: buildPagination(page, limit, total) },
  });
});

// PATCH /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  // Stops an admin from locking themselves out.
  if (!isActive && String(req.params.id) === String(req.user._id)) {
    throw new AppError("You can't deactivate your own account.", 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isActive = isActive;
  await user.save();

  sendSuccess(res, {
    message: isActive ? "User reactivated" : "User deactivated",
    data: user,
  });
});

// GET /api/admin/courses?search=&status=&page=&limit=
const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);

  const filter = {};

  // A repeated ?search= arrives as an array, so only use it when it's text.
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (search) {
    filter.title = new RegExp(escapeRegex(search), "i");
  }

  // listCoursesRules has already checked that status is draft or published.
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [items, total] = await Promise.all([
    Course.find(filter)
      .select(ADMIN_COURSE_FIELDS)
      .populate("category", "name slug")
      .populate("instructor", "name")
      // _id breaks ties between courses created in the same millisecond, so pages never overlap
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  sendSuccess(res, {
    message: "Courses fetched successfully",
    data: { items, pagination: buildPagination(page, limit, total) },
  });
});

// GET /api/admin/reviews?type=course|site&page=&limit=
const listReviews = asyncHandler(async (req, res) => {
  // listReviewsRules has already checked the type. Course reviews are the default.
  const type = req.query.type || "course";
  const { Model, fields } = REVIEW_TYPES[type];
  const { page, limit, skip } = getPagination(req.query, 10);

  // No isHidden filter: admins see hidden reviews too, so they can show them again.
  let reviews = Model.find()
    .select(fields)
    .populate("user", "name email")
    // _id breaks ties between reviews saved in the same millisecond, so pages never overlap
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  if (type === "course") {
    reviews = reviews.populate("course", "title");
  }

  const [items, total] = await Promise.all([reviews, Model.countDocuments()]);

  sendSuccess(res, {
    message: "Reviews fetched successfully",
    data: { items, pagination: buildPagination(page, limit, total) },
  });
});

// PATCH /api/admin/reviews/:type/:id/visibility
const updateReviewVisibility = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const review = await REVIEW_TYPES[type].Model.findById(id);
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  review.isHidden = req.body.isHidden;
  await review.save();
  // A hidden course review stops counting towards its course's rating, and a shown one counts again.
  if (type === "course") {
    await recalculateCourseRating(review.course);
  }

  sendSuccess(res, {
    message: review.isHidden ? "Review hidden" : "Review shown",
    data: review,
  });
});

module.exports = {
  getStats,
  listUsers,
  updateUserStatus,
  listCourses,
  listReviews,
  updateReviewVisibility,
};
