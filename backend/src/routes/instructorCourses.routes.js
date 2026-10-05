const express = require("express");

const {
  getMyCourses,
  getMyCourse,
} = require("../controllers/instructorCourse.controller");

const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get(
  "/courses",
  protect,
  authorize("instructor"),
  getMyCourses,
);

router.get(
  "/courses/:id",
  protect,
  authorize("instructor"),
  validateObjectId(),
  getMyCourse,
);

module.exports = router;