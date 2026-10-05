const courseService = require("../services/course.service");
const { sendSuccess } = require("../utils/apiResponse");

async function getMyCourses(req, res) {
  const courses = await courseService.getInstructorCourses(
    req.user._id,
  );

  sendSuccess(res, {
    message: "Instructor courses fetched successfully",
    data: courses,
  });
}

async function getMyCourse(req, res) {
  const course = await courseService.getInstructorCourse(
    req.params.id,
    req.user,
  );

  sendSuccess(res, {
    message: "Instructor course fetched successfully",
    data: course,
  });
}

module.exports = {
  getMyCourses,
  getMyCourse,
};