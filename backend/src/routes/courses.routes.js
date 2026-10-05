// Owner: Member B
// Endpoints:
//   GET    /api/courses               Public           Published courses with search, filters, sort, pagination
//   GET    /api/courses/:id           Public           One published course with lesson outline
//   POST   /api/courses               Instructor       Create a course (starts as a draft)
//   PATCH  /api/courses/:id           Owner or admin   Update course details
//   PATCH  /api/courses/:id/status    Owner or admin   Publish or unpublish { status }
//   DELETE /api/courses/:id           Owner or admin   Delete a course with no students, and its lessons
//   POST   /api/courses/:id/lessons   Owner            Add a lesson

// learning.routes.js (Member C) is also mounted at /api/courses, after this file.
// Put protect/authorize on each route here, not router.use(), or it would affect C's route too.

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

router.get("/:id", validateObjectId(), getCourse);

// Instructor/admin
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  courseCreateRules,
  validate,
  createCourse
);

router.patch(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  validateObjectId(),
  courseUpdateRules,
  validate,
  updateCourse
);

router.patch(
  "/:id/status",
  protect,
  authorize("instructor", "admin"),
  validateObjectId(),
  courseStatusRules,
  validate,
  updateCourseStatus
);

router.delete("/:id", protect, authorize("instructor", "admin"), validateObjectId(), deleteCourse);

// Instructor course lessons
router.post(
  "/:id/lessons",
  protect,
  authorize("instructor"),
  validateObjectId(),
  lessonCreateRules,
  validate,
  createLesson
);

module.exports = router;
