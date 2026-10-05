// Owner: Member B
// Endpoints:
//   GET /api/instructor/courses       Instructor           My courses, any status
//   GET /api/instructor/courses/:id   Instructor (owner)   My course with full lessons, for the edit page

// instructorStats.routes.js (Member C) is also mounted at /api/instructor.
// Put protect/authorize on each route here, not router.use(), or it would affect C's route too.

const express = require("express");

const { getMyCourses, getMyCourse } = require("../controllers/instructorCourse.controller");

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/courses", protect, authorize("instructor"), getMyCourses);

router.get("/courses/:id", protect, authorize("instructor"), validateObjectId(), getMyCourse);

module.exports = router;
