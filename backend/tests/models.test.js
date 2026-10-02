const mongoose = require("mongoose");
const Order = require("../src/models/Order");
const Enrollment = require("../src/models/Enrollment");
const generateReference = require("../src/utils/generateReference");
const { createUser } = require("./helpers");

// The Course model isn't needed here. A fresh ObjectId is enough for the "course" field.
const newCourseId = () => new mongoose.Types.ObjectId();

function orderData(overrides = {}) {
  return {
    course: newCourseId(),
    amount: 180,
    paymentMethod: "momo",
    reference: generateReference(),
    ...overrides,
  };
}

beforeAll(async () => {
  await Enrollment.init();
  await Order.init();
  // tests/setup.js connects with autoIndex off, so init() alone doesn't build the indexes.
  // createIndexes() does, and the duplicate tests below depend on them.
  await Enrollment.createIndexes();
  await Order.createIndexes();
});

describe("Order model", () => {
  it("saves a valid order with status pending", async () => {
    const user = await createUser();
    const order = await Order.create(orderData({ user: user._id }));

    expect(order.status).toBe("pending");
    expect(order.amount).toBe(180);
    expect(order.paidAt).toBeUndefined();
  });

  it("rejects two orders with the same reference", async () => {
    const user = await createUser();
    await Order.create(orderData({ user: user._id, reference: "ADS-SAME01" }));

    await expect(
      Order.create(orderData({ user: user._id, reference: "ADS-SAME01" }))
    ).rejects.toMatchObject({ code: 11000 });
  });

  it("fails validation when paymentMethod is cash", async () => {
    const user = await createUser();

    await expect(
      Order.create(orderData({ user: user._id, paymentMethod: "cash" }))
    ).rejects.toMatchObject({
      name: "ValidationError",
      errors: { paymentMethod: expect.objectContaining({ message: "Choose a payment method." }) },
    });
  });
});

describe("Enrollment model", () => {
  it("rejects a second enrollment for the same user and course", async () => {
    const user = await createUser();
    const course = newCourseId();
    await Enrollment.create({ user: user._id, course });

    await expect(Enrollment.create({ user: user._id, course })).rejects.toMatchObject({
      code: 11000,
    });
  });

  it("fails validation when progress is 120", async () => {
    const user = await createUser();

    await expect(
      Enrollment.create({ user: user._id, course: newCourseId(), progress: 120 })
    ).rejects.toMatchObject({ name: "ValidationError" });
  });
});
