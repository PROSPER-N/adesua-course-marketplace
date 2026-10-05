const express = require("express");

const { updateLesson, deleteLesson } = require("../controllers/lesson.controller");

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

const { lessonUpdateRules } = require("../validators/lesson.validators");

const router = express.Router();

router.patch(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  validateObjectId(),
  lessonUpdateRules,
  validate,
  updateLesson
);

router.delete("/:id", protect, authorize("instructor", "admin"), validateObjectId(), deleteLesson);

module.exports = router;
