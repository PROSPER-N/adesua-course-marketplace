const express = require("express");

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
} = require("../controllers/course.controller");

const { createLesson } = require("../controllers/lesson.controller");

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

const {
  courseCreateRules,
  courseUpdateRules,
  courseStatusRules,
  courseQueryRules,
} = require("../validators/course.validators");

const { lessonCreateRules } = require("../validators/lesson.validators");

const router = express.Router();

// Public
router.get("/", courseQueryRules, validate, getCourses);

router.get(
  "/:id",
  validateObjectId(),
  getCourse,
);

// Instructor/admin
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  courseCreateRules,
  validate,
  createCourse,
);

router.patch(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  validateObjectId(),
  courseUpdateRules,
  validate,
  updateCourse,
);

router.patch(
  "/:id/status",
  protect,
  authorize("instructor", "admin"),
  validateObjectId(),
  courseStatusRules,
  validate,
  updateCourseStatus,
);

router.delete(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  validateObjectId(),
  deleteCourse,
);

// Instructor course lessons
router.post(
  "/:id/lessons",
  protect,
  authorize("instructor"),
  validateObjectId(),
  lessonCreateRules,
  validate,
  createLesson,
);

module.exports = router;