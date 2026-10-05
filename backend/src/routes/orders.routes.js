// Owner: Member C
// Endpoints:
//   POST /api/orders           Student       Start checkout { courseId, paymentMethod }
//   POST /api/orders/:id/pay   Order owner   Demo payment: mark paid and enroll
//   GET  /api/orders/my        Student       Purchase history

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { createOrderRules } = require("../validators/order.validators");
const { createOrder, payOrder, getMyOrders } = require("../controllers/order.controller");

const router = express.Router();

router.post("/", protect, authorize("student"), createOrderRules, validate, createOrder);
// No body, so validateObjectId is its only check. The controller checks who owns the order.
router.post("/:id/pay", validateObjectId(), protect, authorize("student"), payOrder);
router.get("/my", protect, authorize("student"), getMyOrders);

module.exports = router;
