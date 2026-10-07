const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Course = require("../src/models/Course");
const CourseReview = require("../src/models/CourseReview");
const Enrollment = require("../src/models/Enrollment");
const { recalculateCourseRating } = require("../src/services/review.service");
const { createUser, createCourse, tokenFor } = require("./helpers");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";
const NOT_ENROLLED_MSG = "Enroll in this course to review it.";

const validReview = {
  courseRating: 4,
  instructorRating: 5,
  comment: "Clear lessons and useful examples.",
};

const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

// A new student enrolled in the course.
async function enrolledStudent(course) {
  const student = await createUser();
  await Enrollment.create({ user: student._id, course: course._id });
  return student;
}

// A visible review of the course by a new student. Overrides change any field.
async function addReview(course, overrides = {}) {
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

describe("CourseReview model", () => {
  async function reviewData(overrides = {}) {
    const student = await createUser();
    const course = await createCourse({ status: "published" });
    return {
      user: student._id,
      course: course._id,
      courseRating: 5,
      instructorRating: 4,
      comment: "Clear lessons and useful examples.",
      ...overrides,
    };
  }

  it("allows one review per student per course", async () => {
    const data = await reviewData();
    await CourseReview.create(data);

    await expect(CourseReview.create(data)).rejects.toMatchObject({ code: 11000 });
  });

  it.each([0, 6, 4.5])("refuses a rating of %s", async (rating) => {
    const data = await reviewData({ courseRating: rating, instructorRating: rating });

    await expect(CourseReview.create(data)).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        courseRating: expect.objectContaining({ message: RATING_MSG }),
        instructorRating: expect.objectContaining({ message: RATING_MSG }),
      },
    });
  });

  it.each([
    ["under 10 characters once trimmed", "   Too short   "],
    ["over 1000 characters", "a".repeat(1001)],
  ])("refuses a comment %s", async (_, comment) => {
    const data = await reviewData({ comment });

    await expect(CourseReview.create(data)).rejects.toMatchObject({
      name: "ValidationError",
      errors: { comment: expect.objectContaining({ message: COMMENT_MSG }) },
    });
  });

  it("starts visible", async () => {
    const review = await CourseReview.create(await reviewData());

    expect(review.isHidden).toBe(false);
  });
});

describe("recalculateCourseRating", () => {
  it("stores the average of the visible reviews, rounded to 1 decimal", async () => {
    const course = await createCourse({ status: "published" });
    await addReview(course, { courseRating: 5 });
    await addReview(course, { courseRating: 4 });
    await addReview(course, { courseRating: 4 });
    await addReview(course, { courseRating: 1, isHidden: true });

    await recalculateCourseRating(course._id);

    // (5 + 4 + 4) / 3 = 4.33…, and the hidden 1 doesn't count.
    const saved = await Course.findById(course._id).lean();
    expect(saved.ratingAverage).toBe(4.3);
    expect(saved.ratingCount).toBe(3);
  });

  it("goes back to 0 when no visible reviews are left", async () => {
    const course = await createCourse({ status: "published" });
    await Course.updateOne({ _id: course._id }, { ratingAverage: 4, ratingCount: 1 });
    await addReview(course, { isHidden: true });

    await recalculateCourseRating(course._id);

    const saved = await Course.findById(course._id).lean();
    expect(saved).toMatchObject({ ratingAverage: 0, ratingCount: 0 });
  });

  it("starts every new course at 0", async () => {
    const course = await createCourse();

    expect(course).toMatchObject({ ratingAverage: 0, ratingCount: 0 });
  });
});

describe("GET /api/courses/:id/reviews", () => {
  it("lists visible reviews, newest first, with a summary", async () => {
    const course = await createCourse({ status: "published" });
    await addReview(course, { courseRating: 5, comment: "The first review of the course." });
    await addReview(course, { courseRating: 4, comment: "The second review of the course." });
    await addReview(course, { courseRating: 1, isHidden: true, comment: "A hidden review here." });
    await addReview(course, { courseRating: 4, comment: "The newest review of the course." });

    const res = await request(app).get(`/api/courses/${course._id}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reviews fetched successfully");
    expect(res.body.data.items.map((item) => item.comment)).toEqual([
      "The newest review of the course.",
      "The second review of the course.",
      "The first review of the course.",
    ]);
    expect(Object.keys(res.body.data.items[0]).sort()).toEqual([
      "_id",
      "comment",
      "courseRating",
      "createdAt",
      "instructorRating",
      "updatedAt",
      "user",
    ]);
    expect(Object.keys(res.body.data.items[0].user).sort()).toEqual(["_id", "name"]);
    // (5 + 4 + 4) / 3 = 4.33…, and the hidden 1 isn't counted.
    expect(res.body.data.summary).toEqual({
      average: 4.3,
      count: 3,
      breakdown: { 5: 1, 4: 2, 3: 0, 2: 0, 1: 0 },
    });
  });

  it("pages through the reviews", async () => {
    const course = await createCourse({ status: "published" });
    for (let i = 0; i < 3; i++) await addReview(course);

    const res = await request(app)
      .get(`/api/courses/${course._id}/reviews`)
      .query({ limit: 2, page: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("returns an empty list and a zero summary when there are no reviews", async () => {
    const course = await createCourse({ status: "published" });

    const res = await request(app).get(`/api/courses/${course._id}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.summary).toEqual({
      average: 0,
      count: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  });

  it("returns 404 for a draft or unknown course", async () => {
    const draft = await createCourse({ status: "draft" });
    const unknownId = new mongoose.Types.ObjectId();

    for (const id of [draft._id, unknownId]) {
      const res = await request(app).get(`/api/courses/${id}/reviews`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Course not found");
    }
  });

  it("returns 400 for a bad ID or page", async () => {
    const course = await createCourse({ status: "published" });

    const badId = await request(app).get("/api/courses/abc/reviews");
    const badPage = await request(app).get(`/api/courses/${course._id}/reviews`).query({ page: 0 });

    expect(badId.status).toBe(400);
    expect(badId.body.message).toBe("Invalid ID");
    expect(badPage.status).toBe(400);
    expect(badPage.body.errors).toEqual([
      { field: "page", message: "Page and limit must be positive numbers." },
    ]);
  });
});

describe("My course review: /api/courses/:id/reviews/mine", () => {
  const mine = (course) => `/api/courses/${course._id}/reviews/mine`;

  it("needs a logged-in student for every method", async () => {
    const course = await createCourse({ status: "published" });
    const instructor = await createUser({ role: "instructor" });
    const admin = await createUser({ role: "admin" });

    for (const method of ["get", "put", "delete"]) {
      const guest = await request(app)[method](mine(course)).send(validReview);
      expect(guest.status).toBe(401);
      expect(guest.body.message).toBe("Please log in to continue");

      for (const user of [instructor, admin]) {
        const res = await request(app)
          [method](mine(course))
          .set(authHeader(user))
          .send(validReview);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("You don't have permission to do that");
      }
    }
  });

  it("creates the review (201), then updates it (200)", async () => {
    const course = await createCourse({ status: "published" });
    const student = await enrolledStudent(course);

    const created = await request(app).put(mine(course)).set(authHeader(student)).send(validReview);
    const updated = await request(app)
      .put(mine(course))
      .set(authHeader(student))
      .send({
        ...validReview,
        courseRating: 2,
        comment: "  Changed my mind after the last lessons.  ",
      });

    expect(created.status).toBe(201);
    expect(created.body.message).toBe("Review created successfully");
    expect(created.body.data).toMatchObject({ ...validReview, isHidden: false });
    expect(updated.status).toBe(200);
    expect(updated.body.message).toBe("Review updated successfully");
    expect(updated.body.data).toMatchObject({
      courseRating: 2,
      comment: "Changed my mind after the last lessons.",
    });
    expect(await CourseReview.countDocuments({ course: course._id })).toBe(1);
  });

  it("returns null before the student reviews, then their review", async () => {
    const course = await createCourse({ status: "published" });
    const student = await enrolledStudent(course);

    const before = await request(app).get(mine(course)).set(authHeader(student));
    await request(app).put(mine(course)).set(authHeader(student)).send(validReview);
    const after = await request(app).get(mine(course)).set(authHeader(student));

    expect(before.status).toBe(200);
    expect(before.body.data).toBeNull();
    expect(after.body.message).toBe("Review fetched successfully");
    expect(after.body.data).toMatchObject({ ...validReview, isHidden: false });
  });

  it("refuses a student who isn't enrolled", async () => {
    const course = await createCourse({ status: "published" });
    const student = await createUser();

    const res = await request(app).put(mine(course)).set(authHeader(student)).send(validReview);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(NOT_ENROLLED_MSG);
  });

  it.each([0, 6, 4.5, "4", null])("refuses %p as a rating", async (rating) => {
    const course = await createCourse({ status: "published" });
    const student = await enrolledStudent(course);

    const res = await request(app)
      .put(mine(course))
      .set(authHeader(student))
      .send({ ...validReview, courseRating: rating, instructorRating: rating });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "courseRating", message: RATING_MSG },
      { field: "instructorRating", message: RATING_MSG },
    ]);
  });

  it.each([
    ["9 characters once trimmed", "  Too short  "],
    ["1001 characters", "a".repeat(1001)],
    ["no comment", undefined],
  ])("refuses a comment with %s", async (_, comment) => {
    const course = await createCourse({ status: "published" });
    const student = await enrolledStudent(course);

    const res = await request(app)
      .put(mine(course))
      .set(authHeader(student))
      .send({ ...validReview, comment });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "comment", message: COMMENT_MSG }]);
  });

  it("keeps a hidden review hidden when it's edited", async () => {
    const course = await createCourse({ status: "published" });
    const student = await enrolledStudent(course);
    await request(app).put(mine(course)).set(authHeader(student)).send(validReview);
    await CourseReview.updateOne({ user: student._id }, { isHidden: true });

    const res = await request(app)
      .put(mine(course))
      .set(authHeader(student))
      .send({ ...validReview, courseRating: 5, isHidden: false });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ courseRating: 5, isHidden: true });
  });

  it("keeps the course's stored rating right as reviews change", async () => {
    const course = await createCourse({ status: "published" });
    const first = await enrolledStudent(course);
    const second = await enrolledStudent(course);
    const stored = () =>
      Course.findById(course._id).select("ratingAverage ratingCount -_id").lean();

    await request(app).put(mine(course)).set(authHeader(first)).send(validReview);
    expect(await stored()).toEqual({ ratingAverage: 4, ratingCount: 1 });

    await request(app)
      .put(mine(course))
      .set(authHeader(second))
      .send({ ...validReview, courseRating: 5 });
    expect(await stored()).toEqual({ ratingAverage: 4.5, ratingCount: 2 });

    await request(app)
      .put(mine(course))
      .set(authHeader(first))
      .send({ ...validReview, courseRating: 2 });
    expect(await stored()).toEqual({ ratingAverage: 3.5, ratingCount: 2 });

    const deleted = await request(app).delete(mine(course)).set(authHeader(second));
    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe("Review deleted successfully");
    expect(await stored()).toEqual({ ratingAverage: 2, ratingCount: 1 });
  });

  it("returns 404 when there's no review to delete", async () => {
    const course = await createCourse({ status: "published" });
    const student = await enrolledStudent(course);

    const res = await request(app).delete(mine(course)).set(authHeader(student));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Review not found");
  });

  it("returns 404 for a draft course", async () => {
    const course = await createCourse({ status: "draft" });
    const student = await enrolledStudent(course);

    const res = await request(app).put(mine(course)).set(authHeader(student)).send(validReview);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Course not found");
  });
});
