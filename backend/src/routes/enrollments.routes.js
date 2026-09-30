// Owner: Member C
// Endpoints:
//   POST  /api/enrollments                                        Student            Enroll in a free course { courseId }
//   GET   /api/enrollments/my                                     Student            My courses with progress
//   PATCH /api/enrollments/:courseId/lessons/:lessonId/complete   Enrolled student   Mark a lesson complete

const express = require("express");

const router = express.Router();

// TODO (Member C): add the enrollment routes.

module.exports = router;
