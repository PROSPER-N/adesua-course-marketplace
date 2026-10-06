// Owner: Member A
// Endpoints:
//   GET /api/stats  Public  Published courses, instructors, learners and categories

const express = require("express");
const { getPublicStats } = require("../controllers/stats.controller");

const router = express.Router();

router.get("/", getPublicStats);

module.exports = router;
