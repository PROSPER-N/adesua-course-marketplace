// Every route file is mounted here, so nobody needs to edit app.js or this file later.
// Owners and endpoints are listed at the top of each route file and in docs/API_CONTRACT.md.

const express = require("express");

const healthRoutes = require("./health.routes");
const statsRoutes = require("./stats.routes");
const authRoutes = require("./auth.routes");
const categoriesRoutes = require("./categories.routes");
const adminRoutes = require("./admin.routes");
const coursesRoutes = require("./courses.routes");
const learningRoutes = require("./learning.routes");
const lessonsRoutes = require("./lessons.routes");
const instructorCoursesRoutes = require("./instructorCourses.routes");
const instructorStatsRoutes = require("./instructorStats.routes");
const enrollmentsRoutes = require("./enrollments.routes");
const ordersRoutes = require("./orders.routes");

const router = express.Router();

router.use("/health", healthRoutes); // Member A
router.use("/stats", statsRoutes); // Member A
router.use("/auth", authRoutes); // Member A
router.use("/categories", categoriesRoutes); // Member A
router.use("/admin", adminRoutes); // Member A

// Two files share /api/courses. Express tries them in this order,
// so learning.routes.js (GET /:id/lessons only) goes after courses.routes.js.
router.use("/courses", coursesRoutes); // Member B
router.use("/courses", learningRoutes); // Member C

router.use("/lessons", lessonsRoutes); // Member B

// Two files share /api/instructor: /courses routes (B) and /stats (C).
router.use("/instructor", instructorCoursesRoutes); // Member B
router.use("/instructor", instructorStatsRoutes); // Member C

router.use("/enrollments", enrollmentsRoutes); // Member C
router.use("/orders", ordersRoutes); // Member C

module.exports = router;
