const courseService = require("../services/course.service");
const { sendSuccess } = require("../utils/apiResponse");

async function createLesson(req, res) {
  const lesson = await courseService.createLesson(
    req.params.id,
    req.body,
    req.user,
  );

  sendSuccess(res, {
    statusCode: 201,
    message: "Lesson created successfully",
    data: lesson,
  });
}

async function updateLesson(req, res) {
  const lesson = await courseService.updateLesson(
    req.params.id,
    req.body,
    req.user,
  );

  sendSuccess(res, {
    message: "Lesson updated successfully",
    data: lesson,
  });
}

async function deleteLesson(req, res) {
  await courseService.deleteLesson(req.params.id, req.user);

  sendSuccess(res, {
    message: "Lesson deleted successfully",
  });
}

module.exports = {
  createLesson,
  updateLesson,
  deleteLesson,
};