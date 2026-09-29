// Owner: Member C
// Mounted at /api/courses, after courses.routes.js. Endpoints (see docs/API_CONTRACT.md):
//   GET /api/courses/:id/lessons   Enrolled student, owner, admin   Full lessons plus my progress
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.
//
// This file holds only the route above. Everything else under /api/courses is in courses.routes.js (Member B).

const express = require("express");

const router = express.Router();

// TODO (Member C): add the lesson player route.

module.exports = router;
