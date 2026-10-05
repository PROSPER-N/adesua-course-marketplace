const request = require("supertest");
const app = require("../src/app");
const Order = require("../src/models/Order");
const generateReference = require("../src/utils/generateReference");
const { createUser, tokenFor, createCourse } = require("./helpers");

async function loginAs(role) {
  const user = await createUser({ role });
  return { user, auth: `Bearer ${tokenFor(user)}` };
}

function getStats(auth) {
  const req = request(app).get("/api/instructor/stats");
  if (auth) req.set("Authorization", auth);
  return req;
}

function orderFor(student, course, status) {
  return {
    user: student._id,
    course: course._id,
    amount: course.price,
    paymentMethod: "momo",
    status,
    reference: generateReference(),
    paidAt: status === "paid" ? new Date() : undefined,
  };
}

describe("GET /api/instructor/stats", () => {
  it("returns 401 without a token", async () => {
    const res = await getStats();

    expect(res.status).toBe(401);
  });

  it("returns 403 for a student and an admin", async () => {
    for (const role of ["student", "admin"]) {
      const { auth } = await loginAs(role);
      const res = await getStats(auth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You don't have permission to do that");
    }
  });

  it("returns zeros and no courses for an instructor without courses", async () => {
    const { auth } = await loginAs("instructor");

    const res = await getStats(auth);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      totalStudents: 0,
      totalEarnings: 0,
      publishedCount: 0,
      draftCount: 0,
      courses: [],
    });
  });

  it("adds up students and paid orders for my own courses, newest first", async () => {
    const { user: me, auth } = await loginAs("instructor");
    const otherInstructor = await createUser({ role: "instructor" });
    const draft = await createCourse({ title: "Draft course", instructor: me._id });
    const paidCourse = await createCourse({
      title: "Paid course",
      instructor: me._id,
      status: "published",
      price: 180,
      studentCount: 2,
    });
    const theirCourse = await createCourse({
      instructor: otherInstructor._id,
      status: "published",
      price: 50,
      studentCount: 1,
    });
    const [ama, kojo, esi] = await Promise.all([createUser(), createUser(), createUser()]);
    await Order.create([
      orderFor(ama, paidCourse, "paid"),
      orderFor(kojo, paidCourse, "paid"),
      orderFor(esi, paidCourse, "pending"),
      orderFor(ama, theirCourse, "paid"),
    ]);

    const res = await getStats(auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Stats fetched successfully");
    expect(res.body.data).toEqual({
      totalStudents: 2,
      totalEarnings: 360,
      publishedCount: 1,
      draftCount: 1,
      courses: [
        { courseId: String(paidCourse._id), title: "Paid course", studentCount: 2, earnings: 360 },
        { courseId: String(draft._id), title: "Draft course", studentCount: 0, earnings: 0 },
      ],
    });
  });
});
