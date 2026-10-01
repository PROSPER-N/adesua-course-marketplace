// Owner: Member C
// Endpoints:
//   POST /api/orders           Student       Start checkout { courseId, paymentMethod }
//   POST /api/orders/:id/pay   Order owner   Demo payment: mark paid and enroll
//   GET  /api/orders/my        Student       Purchase history

const express = require("express");

const router = express.Router();

// TODO (Member C): add the order routes.

module.exports = router;
