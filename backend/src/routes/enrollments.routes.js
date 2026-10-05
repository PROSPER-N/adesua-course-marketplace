// Owner: Member C
// Endpoints:
//   POST  /api/enrollments                                        Student            Enroll in a free course { courseId }
//   GET   /api/enrollments/my                                     Student            My courses with progress
//   PATCH /api/enrollments/:courseId/lessons/:lessonId/complete   Enrolled student   Mark a lesson complete

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { enrollRules } = require("../validators/enrollment.validators");
const {
  enroll,
  getMyEnrollments,
  completeLesson,
} = require("../controllers/enrollment.controller");

const router = express.Router();

router.post("/", protect, authorize("student"), enrollRules, validate, enroll);
router.get("/my", protect, authorize("student"), getMyEnrollments);
// No body, so validateObjectId is its only check. The controller checks the enrollment.
router.patch(
  "/:courseId/lessons/:lessonId/complete",
  validateObjectId("courseId", "lessonId"),
  protect,
  authorize("student"),
  completeLesson
);

module.exports = router;
