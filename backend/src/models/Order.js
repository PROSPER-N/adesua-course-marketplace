const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Referred to by name only, so this works before the Course model is merged.
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Always copied from the course price on the server, never taken from the request.
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount can't be negative."],
    },
    paymentMethod: {
      type: String,
      required: [true, "Choose a payment method."],
      enum: {
        values: ["momo", "card"],
        message: "Choose a payment method.",
      },
    },
    // stats.service.js reads these exact values to total the paid orders.
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
