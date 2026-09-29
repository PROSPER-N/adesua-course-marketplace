// Owner: Member B
// Mounted at /api/instructor. Endpoints (see docs/API_CONTRACT.md):
//   GET /api/instructor/courses       Instructor           My courses, any status
//   GET /api/instructor/courses/:id   Instructor (owner)   My course with full lessons, for the edit page
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.
//
// instructorStats.routes.js (Member C) is also mounted at /api/instructor.
// Put protect/authorize on each route here, not router.use(), or it would affect C's route too.

const express = require("express");

const router = express.Router();

// TODO (Member B): add the instructor course routes.

module.exports = router;
