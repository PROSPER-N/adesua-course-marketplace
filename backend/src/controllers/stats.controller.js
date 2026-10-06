const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getPublicStats = asyncHandler(async (_req, res) => {
  const [courses, instructorIds, learners, categories] = await Promise.all([
    Course.countDocuments({ status: "published" }),
    Course.distinct("instructor", { status: "published" }),
    User.countDocuments({ role: "student" }),
    Category.countDocuments(),
  ]);
  const instructors = await User.countDocuments({
    role: "instructor",
    _id: { $in: instructorIds },
  });

  sendSuccess(res, {
    message: "Stats fetched successfully",
    data: { courses, instructors, learners, categories },
  });
});

module.exports = { getPublicStats };
