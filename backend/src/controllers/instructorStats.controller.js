const Course = require("../models/Course");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// GET /api/instructor/stats
const getInstructorStats = asyncHandler(async (req, res) => {
  // Drafts too, so the dashboard can count them.
  const courses = await Course.find({ instructor: req.user._id })
    .select("title status studentCount")
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  // Earnings come from paid orders only. A pending order hasn't been paid yet.
  const paidRows = await Order.aggregate([
    { $match: { status: "paid", course: { $in: courses.map((course) => course._id) } } },
    { $group: { _id: "$course", total: { $sum: "$amount" } } },
  ]);
  const earningsByCourse = {};
  for (const row of paidRows) {
    earningsByCourse[String(row._id)] = row.total;
  }

  const items = courses.map((course) => ({
    courseId: course._id,
    title: course.title,
    studentCount: course.studentCount,
    earnings: earningsByCourse[String(course._id)] || 0,
  }));

  sendSuccess(res, {
    message: "Stats fetched successfully",
    data: {
      // A student in two of these courses counts twice, the same as in each course's studentCount.
      totalStudents: items.reduce((sum, item) => sum + item.studentCount, 0),
      totalEarnings: items.reduce((sum, item) => sum + item.earnings, 0),
      publishedCount: courses.filter((course) => course.status === "published").length,
      draftCount: courses.filter((course) => course.status === "draft").length,
      courses: items,
    },
  });
});

module.exports = { getInstructorStats };
