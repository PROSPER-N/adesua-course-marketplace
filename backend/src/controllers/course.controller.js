const { matchedData } = require("express-validator");
const courseService = require("../services/course.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// GET /api/courses
const getCourses = asyncHandler(async (req, res) => {
  const query = matchedData(req, {
    locations: ["query"],
    includeOptionals: true,
  });

  const data = await courseService.getPublishedCourses(query);

  sendSuccess(res, {
    message: "Courses fetched successfully",
    data,
  });
});

// GET /api/courses/:id
const getCourse = asyncHandler(async (req, res) => {
  const data = await courseService.getPublishedCourseById(req.params.id);

  sendSuccess(res, {
    message: "Course fetched successfully",
    data,
  });
});

// POST /api/courses
const createCourse = asyncHandler(async (req, res) => {
  const data = await courseService.createCourse(req.body, req.user._id);

  sendSuccess(res, {
    statusCode: 201,
    message: "Course created successfully",
    data,
  });
});

// PATCH /api/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const data = await courseService.updateCourse(req.params.id, req.body, req.user);

  sendSuccess(res, {
    message: "Course updated successfully",
    data,
  });
});

// PATCH /api/courses/:id/status
const updateCourseStatus = asyncHandler(async (req, res) => {
  const data = await courseService.updateCourseStatus(req.params.id, req.body.status, req.user);

  sendSuccess(res, {
    message: "Course status updated successfully",
    data,
  });
});

// DELETE /api/courses/:id
const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user);

  sendSuccess(res, {
    message: "Course deleted successfully",
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
};
