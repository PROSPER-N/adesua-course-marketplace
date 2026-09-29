// Owner: Member C
// Mounted at /api/orders. Endpoints (see docs/API_CONTRACT.md):
//   POST /api/orders           Student       Start checkout { courseId, paymentMethod }
//   POST /api/orders/:id/pay   Order owner   Demo payment: mark paid and enroll
//   GET  /api/orders/my        Student       Purchase history
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.

const express = require("express");

const router = express.Router();

// TODO (Member C): add the order routes.

module.exports = router;
