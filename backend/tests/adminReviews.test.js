const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Course = require("../src/models/Course");
const CourseReview = require("../src/models/CourseReview");
const SiteReview = require("../src/models/SiteReview");
const { recalculateCourseRating } = require("../src/services/review.service");
const { createUser, createCourse, tokenFor } = require("./helpers");

const TYPE_MSG = "Type must be course or site.";

const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

async function addCourseReview(course, overrides = {}) {
  const student = await createUser();
  return CourseReview.create({
    user: student._id,
    course: course._id,
    courseRating: 5,
    instructorRating: 5,
    comment: "Clear lessons and useful examples.",
    ...overrides,
  });
}

async function addSiteReview(overrides = {}) {
  const user = await createUser();
  return SiteReview.create({
    user: user._id,
    rating: 5,
    comment: "Easy to find a course and start.",
    ...overrides,
  });
}

describe("GET /api/admin/reviews", () => {
  it("lists course reviews by default, newest first, hidden ones included", async () => {
    const admin = await createUser({ role: "admin" });
    const course = await createCourse({ status: "published", title: "Reviewed course title" });
    await addCourseReview(course, { comment: "The older review of the course." });
    await addCourseReview(course, { comment: "The newer review, now hidden.", isHidden: true });

    const res = await request(app).get("/api/admin/reviews").set(authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reviews fetched successfully");
    expect(res.body.data.items.map((item) => [item.comment, item.isHidden])).toEqual([
      ["The newer review, now hidden.", true],
      ["The older review of the course.", false],
    ]);
    const [item] = res.body.data.items;
    expect(Object.keys(item).sort()).toEqual([
      "_id",
      "comment",
      "course",
      "courseRating",
      "createdAt",
      "instructorRating",
      "isHidden",
      "updatedAt",
      "user",
    ]);
    expect(Object.keys(item.user).sort()).toEqual(["_id", "email", "name"]);
    expect(item.course).toEqual({ _id: course._id.toString(), title: "Reviewed course title" });
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
  });

  it("lists platform reviews with ?type=site", async () => {
    const admin = await createUser({ role: "admin" });
    await addSiteReview({ isHidden: true });

    const res = await request(app)
      .get("/api/admin/reviews")
      .query({ type: "site" })
      .set(authHeader(admin));

    expect(res.status).toBe(200);
    const [item] = res.body.data.items;
    expect(Object.keys(item).sort()).toEqual([
      "_id",
      "comment",
      "createdAt",
      "isHidden",
      "rating",
      "updatedAt",
      "user",
    ]);
    expect(Object.keys(item.user).sort()).toEqual(["_id", "email", "name"]);
  });

  it("pages through the reviews", async () => {
    const admin = await createUser({ role: "admin" });
    for (let i = 0; i < 3; i++) await addSiteReview();

    const res = await request(app)
      .get("/api/admin/reviews")
      .query({ type: "site", limit: 2, page: 2 })
      .set(authHeader(admin));

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("returns 400 for a bad type or page", async () => {
    const admin = await createUser({ role: "admin" });

    const badType = await request(app)
      .get("/api/admin/reviews")
      .query({ type: "lesson" })
      .set(authHeader(admin));
    const badPage = await request(app)
      .get("/api/admin/reviews")
      .query({ page: 0 })
      .set(authHeader(admin));

    expect(badType.status).toBe(400);
    expect(badType.body.errors).toEqual([{ field: "type", message: TYPE_MSG }]);
    expect(badPage.status).toBe(400);
    expect(badPage.body.errors).toEqual([
      { field: "page", message: "Page and limit must be positive numbers." },
    ]);
  });

  it("is for admins only", async () => {
    const guest = await request(app).get("/api/admin/reviews");
    expect(guest.status).toBe(401);

    for (const role of ["student", "instructor"]) {
      const user = await createUser({ role });
      const res = await request(app).get("/api/admin/reviews").set(authHeader(user));
      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You don't have permission to do that");
    }
  });
});

describe("PATCH /api/admin/reviews/:type/:id/visibility", () => {
  const visibility = (type, id) => `/api/admin/reviews/${type}/${id}/visibility`;

  it("hides and shows a course review, and updates the course's rating", async () => {
    const admin = await createUser({ role: "admin" });
    const course = await createCourse({ status: "published" });
    await addCourseReview(course, { courseRating: 5 });
    const review = await addCourseReview(course, { courseRating: 3 });
    await recalculateCourseRating(course._id);
    const stored = () =>
      Course.findById(course._id).select("ratingAverage ratingCount -_id").lean();
    const publicCount = async () =>
      (await request(app).get(`/api/courses/${course._id}/reviews`)).body.data.items.length;

    expect(await stored()).toEqual({ ratingAverage: 4, ratingCount: 2 });

    const hidden = await request(app)
      .patch(visibility("course", review._id))
      .set(authHeader(admin))
      .send({ isHidden: true });

    expect(hidden.status).toBe(200);
    expect(hidden.body.message).toBe("Review hidden");
    expect(hidden.body.data.isHidden).toBe(true);
    expect(await stored()).toEqual({ ratingAverage: 5, ratingCount: 1 });
    expect(await publicCount()).toBe(1);

    const shown = await request(app)
      .patch(visibility("course", review._id))
      .set(authHeader(admin))
      .send({ isHidden: false });

    expect(shown.status).toBe(200);
    expect(shown.body.message).toBe("Review shown");
    expect(await stored()).toEqual({ ratingAverage: 4, ratingCount: 2 });
    expect(await publicCount()).toBe(2);
  });

  it("hides and shows a platform review", async () => {
    const admin = await createUser({ role: "admin" });
    const review = await addSiteReview();
    const publicList = async () => (await request(app).get("/api/reviews")).body.data;

    await request(app)
      .patch(visibility("site", review._id))
      .set(authHeader(admin))
      .send({ isHidden: true });
    const whileHidden = await publicList();

    await request(app)
      .patch(visibility("site", review._id))
      .set(authHeader(admin))
      .send({ isHidden: false });
    const afterShowing = await publicList();

    expect(whileHidden.items).toEqual([]);
    expect(whileHidden.summary.count).toBe(0);
    expect(afterShowing.items).toHaveLength(1);
    expect(afterShowing.summary.count).toBe(1);
  });

  it("returns 404 for an unknown review", async () => {
    const admin = await createUser({ role: "admin" });
    const unknownId = new mongoose.Types.ObjectId();

    for (const type of ["course", "site"]) {
      const res = await request(app)
        .patch(visibility(type, unknownId))
        .set(authHeader(admin))
        .send({ isHidden: true });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Review not found");
    }
  });

  it("returns 400 for a bad type, ID or isHidden", async () => {
    const admin = await createUser({ role: "admin" });
    const review = await addSiteReview();

    const badType = await request(app)
      .patch(visibility("lesson", review._id))
      .set(authHeader(admin))
      .send({ isHidden: true });
    const badId = await request(app)
      .patch(visibility("site", "abc"))
      .set(authHeader(admin))
      .send({ isHidden: true });
    const badValue = await request(app)
      .patch(visibility("site", review._id))
      .set(authHeader(admin))
      .send({ isHidden: "yes" });

    expect(badType.status).toBe(400);
    expect(badType.body.errors).toEqual([{ field: "type", message: TYPE_MSG }]);
    expect(badId.status).toBe(400);
    expect(badId.body.message).toBe("Invalid ID");
    expect(badValue.status).toBe(400);
    expect(badValue.body.errors).toEqual([
      { field: "isHidden", message: "isHidden must be true or false." },
    ]);
  });

  it("is for admins only", async () => {
    const review = await addSiteReview();
    const student = await createUser();

    const guest = await request(app).patch(visibility("site", review._id)).send({ isHidden: true });
    const asStudent = await request(app)
      .patch(visibility("site", review._id))
      .set(authHeader(student))
      .send({ isHidden: true });

    expect(guest.status).toBe(401);
    expect(asStudent.status).toBe(403);
    expect((await SiteReview.findById(review._id)).isHidden).toBe(false);
  });
});
