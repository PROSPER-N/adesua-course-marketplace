const { matchedData } = require("express-validator");

const courseService = require("../services/course.service");

const { sendSuccess } = require("../utils/apiResponse");

async function getCourses(req, res) {
  const query = matchedData(req, {
    locations: ["query"],
    includeOptionals: true,
  });

  const data = await courseService.getPublishedCourses(query);

  sendSuccess(res, {
    message: "Courses fetched successfully",
    data,
  });
}

async function getCourse(req, res) {
  const data = await courseService.getPublishedCourseById(req.params.id);

  sendSuccess(res, {
    message: "Course fetched successfully",
    data,
  });
}

async function createCourse(req, res) {
  const data = await courseService.createCourse(req.body, req.user._id);

  sendSuccess(res, {
    statusCode: 201,
    message: "Course created successfully",
    data,
  });
}

async function updateCourse(req, res) {
  const data = await courseService.updateCourse(req.params.id, req.body, req.user);

  sendSuccess(res, {
    message: "Course updated successfully",
    data,
  });
}

async function updateCourseStatus(req, res) {
  const data = await courseService.updateCourseStatus(req.params.id, req.body.status, req.user);

  sendSuccess(res, {
    message: "Course status updated successfully",
    data,
  });
}

async function deleteCourse(req, res) {
  await courseService.deleteCourse(req.params.id, req.user);

  sendSuccess(res, {
    message: "Course deleted successfully",
  });
}

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
};
