// Owner: Member B
// Endpoints:
//   GET    /api/courses               Public           Published courses with search, filters, sort, pagination
//   GET    /api/courses/:id           Public           One published course with lesson outline
//   POST   /api/courses               Instructor       Create a course (starts as a draft)
//   PATCH  /api/courses/:id           Owner or admin   Update course details
//   PATCH  /api/courses/:id/status    Owner or admin   Publish or unpublish { status }
//   DELETE /api/courses/:id           Owner or admin   Delete a course with no students, and its lessons
//   POST   /api/courses/:id/lessons   Owner            Add a lesson

// learning.routes.js (Member C) is also mounted at /api/courses, after this file.
// Put protect/authorize on each route here, not router.use(), or it would affect C's route too.

const express = require("express");

const router = express.Router();

// TODO (Member B): add the course routes.

module.exports = router;
