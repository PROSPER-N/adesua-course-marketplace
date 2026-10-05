const courseService = require("../services/course.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// POST /api/courses/:id/lessons
const createLesson = asyncHandler(async (req, res) => {
  const lesson = await courseService.createLesson(req.params.id, req.body, req.user);

  sendSuccess(res, {
    statusCode: 201,
    message: "Lesson created successfully",
    data: lesson,
  });
});

// PATCH /api/lessons/:id
const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await courseService.updateLesson(req.params.id, req.body, req.user);

  sendSuccess(res, {
    message: "Lesson updated successfully",
    data: lesson,
  });
});

// DELETE /api/lessons/:id
const deleteLesson = asyncHandler(async (req, res) => {
  await courseService.deleteLesson(req.params.id, req.user);

  sendSuccess(res, {
    message: "Lesson deleted successfully",
  });
});

module.exports = {
  createLesson,
  updateLesson,
  deleteLesson,
};
