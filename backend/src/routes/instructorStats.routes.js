// Owner: Member C
// Endpoints:
//   GET /api/instructor/stats   Instructor   Students and earnings

// instructorCourses.routes.js (Member B) is also mounted at /api/instructor.
// Put protect/authorize on each route here, not router.use(), or it would affect B's routes too.

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const { getInstructorStats } = require("../controllers/instructorStats.controller");

const router = express.Router();

router.get("/stats", protect, authorize("instructor"), getInstructorStats);

module.exports = router;
