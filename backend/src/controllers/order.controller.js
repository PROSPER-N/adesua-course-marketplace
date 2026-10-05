const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const generateReference = require("../utils/generateReference");
const { sendSuccess } = require("../utils/apiResponse");
const {
  ALREADY_ENROLLED,
  findPublishedCourse,
  isEnrolled,
  enrollStudent,
} = require("../services/enrollment.service");

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const course = await findPublishedCourse(req.body.courseId);

  if (course.price === 0) {
    throw new AppError("This course is free. Enroll directly.", 400);
  }
  if (await isEnrolled(req.user._id, course._id)) {
    throw new AppError(ALREADY_ENROLLED, 409);
  }

  const order = await Order.create({
    user: req.user._id,
    course: course._id,
    // Always the course's price. An amount in the request is ignored.
    amount: course.price,
    paymentMethod: req.body.paymentMethod,
    reference: generateReference(),
  });

  sendSuccess(res, { statusCode: 201, message: "Order created successfully", data: order });
});

// POST /api/orders/:id/pay
// A demo payment: no money moves. The order is marked paid and the student is enrolled.
const payOrder = asyncHandler(async (req, res) => {
  // Another user's order gets the same 404 as a missing one, so its existence isn't revealed.
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    throw new AppError("Order not found", 404);
  }
  if (order.status !== "pending") {
    throw new AppError("This order has already been paid.", 400);
  }
  if (await isEnrolled(req.user._id, order.course)) {
    throw new AppError(ALREADY_ENROLLED, 409);
  }

  // Enroll first. If that fails (the student is already enrolled, say from a second checkout tab),
  // the order stays pending, so nobody pays twice for one course.
  const enrollment = await enrollStudent({
    user: req.user._id,
    course: order.course,
    order: order._id,
  });

  order.status = "paid";
  order.paidAt = new Date();
  await order.save();

  sendSuccess(res, { message: "Payment successful", data: { order, enrollment } });
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("course", "title")
    // _id breaks ties between orders made in the same millisecond
    .sort({ createdAt: -1, _id: -1 });

  sendSuccess(res, { message: "Orders fetched successfully", data: orders });
});

module.exports = { createOrder, payOrder, getMyOrders };
