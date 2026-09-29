// Owner: Member C
// Mounted at /api/instructor. Endpoints (see docs/API_CONTRACT.md):
//   GET /api/instructor/stats   Instructor   Students and earnings
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.
//
// instructorCourses.routes.js (Member B) is also mounted at /api/instructor.
// Put protect/authorize on each route here, not router.use(), or it would affect B's routes too.

const express = require("express");

const router = express.Router();

// TODO (Member C): add the instructor stats route.

module.exports = router;
