const { body } = require("express-validator");

const PAYMENT_METHODS = ["momo", "card"];

// POST /api/orders
const createOrderRules = [
  // isString() comes first, so arrays and objects like { "$gt": "" } are rejected.
  body("courseId", "Invalid ID").isString().isMongoId(),
  // custom() also rejects ["momo"], which isIn() would let through.
  body("paymentMethod", "Choose a payment method.").custom((value) =>
    PAYMENT_METHODS.includes(value)
  ),
];

module.exports = { createOrderRules };
