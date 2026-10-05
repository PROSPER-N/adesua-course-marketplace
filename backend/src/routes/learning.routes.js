// Owner: Member C
// Endpoints:
//   GET /api/courses/:id/lessons   Enrolled student, owner, admin   Full lessons plus my progress

// This file holds only the route above. Everything else under /api/courses is in courses.routes.js (Member B).

const express = require("express");
const protect = require("../middleware/protect");
const validateObjectId = require("../middleware/validateObjectId");
const { getCourseLessons } = require("../controllers/learning.controller");

const router = express.Router();

// No authorize(): students, instructors and admins can all qualify, so the controller decides.
router.get("/:id/lessons", validateObjectId(), protect, getCourseLessons);

module.exports = router;
