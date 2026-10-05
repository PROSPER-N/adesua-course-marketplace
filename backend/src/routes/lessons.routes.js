// Owner: Member B
// Endpoints:
//   PATCH  /api/lessons/:id   Owner   Edit a lesson
//   DELETE /api/lessons/:id   Owner   Delete a lesson

const express = require("express");

const { updateLesson, deleteLesson } = require("../controllers/lesson.controller");

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

const { lessonUpdateRules } = require("../validators/lesson.validators");

const router = express.Router();

// Owner only: the service checks that this instructor owns the lesson's course.
router.patch(
  "/:id",
  validateObjectId(),
  protect,
  authorize("instructor"),
  lessonUpdateRules,
  validate,
  updateLesson
);

// DELETE has no body, so validateObjectId is its only check.
router.delete("/:id", validateObjectId(), protect, authorize("instructor"), deleteLesson);

module.exports = router;
