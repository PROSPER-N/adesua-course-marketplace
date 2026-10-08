// Owner: Member A
// Endpoints:
//   GET /api/instructors   Public   Active instructors with published courses, with their ratings

const express = require("express");
const validate = require("../middleware/validate");
const { instructorListRules } = require("../validators/instructor.validators");
const { getInstructors } = require("../controllers/instructor.controller");

const router = express.Router();

router.get("/", instructorListRules, validate, getInstructors);

module.exports = router;
