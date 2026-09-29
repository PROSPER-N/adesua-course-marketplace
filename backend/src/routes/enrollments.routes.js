// Owner: Member C
// Mounted at /api/enrollments. Endpoints (see docs/API_CONTRACT.md):
//   POST  /api/enrollments                                        Student            Enroll in a free course { courseId }
//   GET   /api/enrollments/my                                     Student            My courses with progress
//   PATCH /api/enrollments/:courseId/lessons/:lessonId/complete   Enrolled student   Mark a lesson complete
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.

const express = require("express");

const router = express.Router();

// TODO (Member C): add the enrollment routes.

module.exports = router;
