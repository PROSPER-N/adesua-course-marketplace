const courseService = require("../services/course.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// GET /api/instructor/courses
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getInstructorCourses(req.user._id);

  sendSuccess(res, {
    message: "Instructor courses fetched successfully",
    data: courses,
  });
});

// GET /api/instructor/courses/:id
const getMyCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getInstructorCourse(req.params.id, req.user);

  sendSuccess(res, {
    message: "Instructor course fetched successfully",
    data: course,
  });
});

module.exports = {
  getMyCourses,
  getMyCourse,
};
