// Owner: Member C
// Endpoints:
//   GET /api/instructor/stats   Instructor   Students and earnings

// instructorCourses.routes.js (Member B) is also mounted at /api/instructor.
// Put protect/authorize on each route here, not router.use(), or it would affect B's routes too.

const express = require("express");

const router = express.Router();

// TODO (Member C): add the instructor stats route.

module.exports = router;
