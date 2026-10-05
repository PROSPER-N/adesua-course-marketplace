const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Course = require("../src/models/Course");
const Enrollment = require("../src/models/Enrollment");
const Order = require("../src/models/Order");
const generateReference = require("../src/utils/generateReference");
const { createUser, tokenFor, createCourse } = require("./helpers");

const newId = () => new mongoose.Types.ObjectId();

async function loginAs(role) {
  const user = await createUser({ role });
  return { user, auth: `Bearer ${tokenFor(user)}` };
}

function paidCourse(overrides = {}) {
  return createCourse({ status: "published", price: 180, ...overrides });
}

async function studentCountOf(course) {
  return (await Course.findById(course._id)).studentCount;
}

async function statusOf(order) {
  return (await Order.findById(order._id)).status;
}

// A pending order made straight in the database, for the pay and list tests.
function pendingOrder(user, course) {
  return Order.create({
    user: user._id,
    course: course._id,
    amount: course.price,
    paymentMethod: "momo",
    reference: generateReference(),
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /api/orders", () => {
  function createOrder(body, auth) {
    const req = request(app).post("/api/orders");
    if (auth) req.set("Authorization", auth);
    return req.send(body);
  }

  it("returns 401 without a token", async () => {
    const course = await paidCourse();

    const res = await createOrder({ courseId: String(course._id), paymentMethod: "momo" });

    expect(res.status).toBe(401);
  });

  it("returns 403 for an instructor and an admin", async () => {
    const course = await paidCourse();

    for (const role of ["instructor", "admin"]) {
      const { auth } = await loginAs(role);
      const res = await createOrder({ courseId: String(course._id), paymentMethod: "momo" }, auth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You don't have permission to do that");
    }
  });

  it("returns 400 when paymentMethod is missing, or isn't momo or card", async () => {
    const { auth } = await loginAs("student");
    const course = await paidCourse();

    for (const paymentMethod of [undefined, "cash"]) {
      const res = await createOrder({ courseId: String(course._id), paymentMethod }, auth);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "paymentMethod", message: "Choose a payment method." },
      ]);
    }
  });

  it("returns 400 when courseId isn't a valid ID", async () => {
    const { auth } = await loginAs("student");

    const res = await createOrder({ courseId: "abc", paymentMethod: "momo" }, auth);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "courseId", message: "Invalid ID" }]);
  });

  it("returns 404 for an unknown course and for a draft", async () => {
    const { auth } = await loginAs("student");
    const draft = await createCourse({ price: 180 });

    for (const courseId of [newId(), draft._id]) {
      const res = await createOrder({ courseId: String(courseId), paymentMethod: "momo" }, auth);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Course not found");
    }
  });

  it("returns 400 for a free course", async () => {
    const { auth } = await loginAs("student");
    const course = await paidCourse({ price: 0 });

    const res = await createOrder({ courseId: String(course._id), paymentMethod: "momo" }, auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("This course is free. Enroll directly.");
  });

  it("returns 409 when the student is already enrolled", async () => {
    const { user, auth } = await loginAs("student");
    const course = await paidCourse();
    await Enrollment.create({ user: user._id, course: course._id });

    const res = await createOrder({ courseId: String(course._id), paymentMethod: "momo" }, auth);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("You're already enrolled in this course.");
    expect(await Order.countDocuments()).toBe(0);
  });

  it("creates a pending order priced from the course, not from the request", async () => {
    const { user, auth } = await loginAs("student");
    const course = await paidCourse({ price: 180 });

    const res = await createOrder(
      { courseId: String(course._id), paymentMethod: "card", amount: 1 },
      auth
    );

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Order created successfully");
    expect(res.body.data).toMatchObject({
      user: String(user._id),
      course: String(course._id),
      amount: 180,
      paymentMethod: "card",
      status: "pending",
    });
    expect(res.body.data.reference).toMatch(/^ADS-[A-Z0-9]{6}$/);
    expect(res.body.data).not.toHaveProperty("paidAt");
  });
});

describe("POST /api/orders/:id/pay", () => {
  function pay(orderId, auth) {
    const req = request(app).post(`/api/orders/${orderId}/pay`);
    if (auth) req.set("Authorization", auth);
    return req;
  }

  it("returns 400 for an invalid ID", async () => {
    const { auth } = await loginAs("student");

    const res = await pay("abc", auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID");
  });

  it("returns 401 without a token", async () => {
    const res = await pay(newId());

    expect(res.status).toBe(401);
  });

  it("returns 403 for an instructor", async () => {
    const { auth } = await loginAs("instructor");

    const res = await pay(newId(), auth);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You don't have permission to do that");
  });

  it("returns 404 for an unknown order and for another student's order", async () => {
    const { auth } = await loginAs("student");
    const classmate = await createUser();
    const theirOrder = await pendingOrder(classmate, await paidCourse());

    for (const orderId of [newId(), theirOrder._id]) {
      const res = await pay(orderId, auth);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Order not found");
    }
    expect(await statusOf(theirOrder)).toBe("pending");
  });

  it("marks the order paid, enrolls the student and adds 1 to studentCount", async () => {
    const { user, auth } = await loginAs("student");
    const course = await paidCourse();
    const order = await pendingOrder(user, course);

    const res = await pay(order._id, auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Payment successful");
    expect(res.body.data.order).toMatchObject({
      _id: String(order._id),
      status: "paid",
      paidAt: expect.any(String),
    });
    expect(res.body.data.enrollment).toMatchObject({
      user: String(user._id),
      course: String(course._id),
      order: String(order._id),
      progress: 0,
    });
    expect(await studentCountOf(course)).toBe(1);
  });

  it("returns 400 when the order has already been paid", async () => {
    const { user, auth } = await loginAs("student");
    const course = await paidCourse();
    const order = await pendingOrder(user, course);
    await pay(order._id, auth);

    const res = await pay(order._id, auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("This order has already been paid.");
    expect(await studentCountOf(course)).toBe(1);
  });

  it("returns 409 for a second order when the student is already enrolled", async () => {
    const { user, auth } = await loginAs("student");
    const course = await paidCourse();
    const firstOrder = await pendingOrder(user, course);
    const secondOrder = await pendingOrder(user, course);
    await pay(firstOrder._id, auth);

    const res = await pay(secondOrder._id, auth);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("You're already enrolled in this course.");
    expect(await statusOf(secondOrder)).toBe("pending");
    expect(await studentCountOf(course)).toBe(1);
  });

  it("leaves the order pending when the check misses an existing enrollment", async () => {
    const { user, auth } = await loginAs("student");
    const course = await paidCourse();
    const firstOrder = await pendingOrder(user, course);
    const secondOrder = await pendingOrder(user, course);
    await pay(firstOrder._id, auth);

    // As if both payments arrived together: the database's unique index has to stop the second.
    jest.spyOn(Enrollment, "exists").mockResolvedValueOnce(null);
    const res = await pay(secondOrder._id, auth);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("You're already enrolled in this course.");
    expect(await statusOf(secondOrder)).toBe("pending");
    expect(await studentCountOf(course)).toBe(1);
  });
});

describe("GET /api/orders/my", () => {
  function getMine(auth) {
    const req = request(app).get("/api/orders/my");
    if (auth) req.set("Authorization", auth);
    return req;
  }

  it("returns 401 without a token", async () => {
    const res = await getMine();

    expect(res.status).toBe(401);
  });

  it("returns 403 for an instructor", async () => {
    const { auth } = await loginAs("instructor");

    const res = await getMine(auth);

    expect(res.status).toBe(403);
  });

  it("returns only my orders, newest first, with the course title", async () => {
    const { user, auth } = await loginAs("student");
    const classmate = await createUser();
    const older = await paidCourse({ title: "Logo design basics" });
    const newer = await paidCourse({ title: "Brand identity" });
    const firstOrder = await pendingOrder(user, older);
    const secondOrder = await pendingOrder(user, newer);
    await pendingOrder(classmate, older);

    const res = await getMine(auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Orders fetched successfully");
    expect(res.body.data.map((order) => order._id)).toEqual([
      String(secondOrder._id),
      String(firstOrder._id),
    ]);
    expect(res.body.data[0]).toMatchObject({
      amount: 180,
      paymentMethod: "momo",
      status: "pending",
      reference: secondOrder.reference,
    });
    expect(res.body.data[0].course).toEqual({ _id: String(newer._id), title: "Brand identity" });
  });
});
