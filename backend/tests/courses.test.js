const request = require("supertest");

const app = require("../src/app");
const { createUser, tokenFor, createCourse, createLessons } = require("./helpers");

const Category = require("../src/models/Category");
const Course = require("../src/models/Course");
const Lesson = require("../src/models/Lesson");
const User = require("../src/models/User");

const PAGE_LIMIT_MSG = "Page and limit must be positive numbers.";

// A valid body for POST /api/courses. A test changes only the field it checks.
function newCourseBody(category, overrides = {}) {
  return {
    title: "Digital Marketing Basics",
    shortDescription: "Learn practical digital marketing skills.",
    description: "A practical introduction to digital marketing for beginners.",
    category: category._id,
    price: 50,
    level: "beginner",
    ...overrides,
  };
}

describe("Courses API", () => {
  describe("GET /api/courses", () => {
    test("returns published courses only", async () => {
      await createCourse({ status: "published" });
      await createCourse({ status: "draft" });

      const res = await request(app).get("/api/courses");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].status).toBeUndefined();
    });

    test("filters by free and paid price", async () => {
      await createCourse({ status: "published", price: 0 });
      await createCourse({ status: "published", price: 100 });

      const freeRes = await request(app).get("/api/courses").query({ price: "free" });

      const paidRes = await request(app).get("/api/courses").query({ price: "paid" });

      expect(freeRes.status).toBe(200);
      expect(freeRes.body.data.items).toHaveLength(1);
      expect(freeRes.body.data.items[0].price).toBe(0);

      expect(paidRes.status).toBe(200);
      expect(paidRes.body.data.items).toHaveLength(1);
      expect(paidRes.body.data.items[0].price).toBe(100);
    });

    test("searches part of a title, ignoring capital letters", async () => {
      await createCourse({ status: "published", title: "Intro to React" });
      await createCourse({ status: "published", title: "Excel for small businesses" });
      await createCourse({ status: "draft", title: "React for teams" });

      const res = await request(app).get("/api/courses").query({ search: "REACT" });

      expect(res.status).toBe(200);
      expect(res.body.data.items.map((course) => course.title)).toEqual(["Intro to React"]);
    });

    test("treats special characters in the search as plain text", async () => {
      await createCourse({ status: "published", title: "Design (for beginners)" });
      await createCourse({ status: "published", title: "Photography basics" });

      const bracket = await request(app).get("/api/courses").query({ search: "(" }); // an unescaped "(" would crash the query
      const anything = await request(app).get("/api/courses").query({ search: ".*" }); // would match everything

      expect(bracket.status).toBe(200);
      expect(bracket.body.data.items.map((course) => course.title)).toEqual([
        "Design (for beginners)",
      ]);
      expect(anything.status).toBe(200);
      expect(anything.body.data.items).toEqual([]);
    });

    test("returns 400 for an invalid filter", async () => {
      const res = await request(app).get("/api/courses").query({ level: "expert" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("returns the contract message for a bad page or limit", async () => {
      const badPage = await request(app).get("/api/courses").query({ page: 0 });
      const badLimit = await request(app).get("/api/courses").query({ limit: "abc" });

      expect(badPage.status).toBe(400);
      expect(badPage.body.errors).toEqual([{ field: "page", message: PAGE_LIMIT_MSG }]);
      expect(badLimit.status).toBe(400);
      expect(badLimit.body.errors).toEqual([{ field: "limit", message: PAGE_LIMIT_MSG }]);
    });
  });

  describe("GET /api/courses/:id", () => {
    test("returns a published course with lessons", async () => {
      const course = await createCourse({ status: "published" });
      await createLessons(course, 2);

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(course._id.toString());
      expect(res.body.data.lessons).toHaveLength(2);
      expect(res.body.data.lessons[0].order).toBe(1);
    });

    test("does not expose private lesson content for non-preview lessons", async () => {
      const course = await createCourse({ status: "published" });
      await createLessons(course, 2);

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.lessons[1].videoUrl).toBeUndefined();
      expect(res.body.data.lessons[1].content).toBeUndefined();
    });

    test("returns only the outline fields, plus the video and notes of a preview", async () => {
      const course = await createCourse({ status: "published" });
      const [first] = await createLessons(course, 2);
      await Lesson.updateOne({ _id: first._id }, { isPreview: true });

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(200);
      const [preview, locked] = res.body.data.lessons;
      expect(Object.keys(preview).sort()).toEqual([
        "_id",
        "content",
        "durationMinutes",
        "isPreview",
        "order",
        "title",
        "videoUrl",
      ]);
      expect(Object.keys(locked).sort()).toEqual([
        "_id",
        "durationMinutes",
        "isPreview",
        "order",
        "title",
      ]);
    });

    test("includes the instructor's headline", async () => {
      const instructor = await createUser({ role: "instructor" });
      await User.updateOne({ _id: instructor._id }, { headline: "Web developer and teacher" });
      const course = await createCourse({ instructor: instructor._id, status: "published" });

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.instructor).toMatchObject({
        name: instructor.name,
        headline: "Web developer and teacher",
      });
    });

    test("returns 404 for a draft course", async () => {
      const course = await createCourse({ status: "draft" });

      const res = await request(app).get(`/api/courses/${course._id}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Course not found");
    });
  });

  describe("POST /api/courses", () => {
    test("instructor can create a draft course", async () => {
      const instructor = await createUser({ role: "instructor" });
      const category = await Category.create({ name: "Business" });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Digital Marketing Basics",
          shortDescription: "Learn practical digital marketing skills.",
          description: "A practical introduction to digital marketing for beginners.",
          category: category._id,
          price: 50,
          level: "beginner",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Course created successfully");
      expect(res.body.data.status).toBe("draft");
      expect(res.body.data.instructor.toString()).toBe(instructor._id.toString());
    });

    test("ignores fields the server sets, like _id, status and the counters", async () => {
      const instructor = await createUser({ role: "instructor" });
      const category = await Category.create({ name: "Business" });
      const token = await tokenFor(instructor);
      const chosenId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Digital Marketing Basics",
          shortDescription: "Learn practical digital marketing skills.",
          description: "A practical introduction to digital marketing for beginners.",
          category: category._id,
          price: 50,
          level: "beginner",
          _id: chosenId,
          createdAt: "2030-01-01T00:00:00.000Z",
          status: "published",
          studentCount: 50,
          lessonCount: 9,
        });

      expect(res.status).toBe(201);
      expect(res.body.data._id).not.toBe(chosenId);
      expect(res.body.data).toMatchObject({ status: "draft", studentCount: 0, lessonCount: 0 });
      expect(new Date(res.body.data.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
      expect(await Course.findById(chosenId)).toBeNull();
    });

    test("admin cannot create a course", async () => {
      const admin = await createUser({ role: "admin" });
      const category = await Category.create({ name: "Business" });
      const token = await tokenFor(admin);

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Digital Marketing Basics",
          shortDescription: "Learn practical digital marketing skills.",
          description: "A practical introduction to digital marketing for beginners.",
          category: category._id,
          price: 50,
          level: "beginner",
        });

      expect(res.status).toBe(403);
      expect(await Course.countDocuments()).toBe(0);
    });

    test("returns the contract messages for a price below 0 or above 5,000", async () => {
      const instructor = await createUser({ role: "instructor" });
      const category = await Category.create({ name: "Business" });
      const token = await tokenFor(instructor);

      const tooLow = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send(newCourseBody(category, { price: -1 }));
      const tooHigh = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send(newCourseBody(category, { price: 6000 }));

      expect(tooLow.status).toBe(400);
      expect(tooLow.body.errors).toEqual([
        { field: "price", message: "Price can't be negative. Enter 0 for a free course." },
      ]);
      expect(tooHigh.status).toBe(400);
      expect(tooHigh.body.errors).toEqual([
        { field: "price", message: "Price can't be more than 5,000." },
      ]);
    });

    test("accepts only an https thumbnail link, or none", async () => {
      const instructor = await createUser({ role: "instructor" });
      const category = await Category.create({ name: "Business" });
      const token = await tokenFor(instructor);
      const post = (thumbnailUrl) =>
        request(app)
          .post("/api/courses")
          .set("Authorization", `Bearer ${token}`)
          .send(newCourseBody(category, { thumbnailUrl }));

      const http = await post("http://example.com/cover.png");
      const https = await post("https://example.com/cover.png");
      const none = await post("");

      expect(http.status).toBe(400);
      expect(http.body.errors).toEqual([
        { field: "thumbnailUrl", message: "Enter a full link starting with https://." },
      ]);
      expect(https.status).toBe(201);
      expect(https.body.data.thumbnailUrl).toBe("https://example.com/cover.png");
      expect(none.status).toBe(201);
    });

    test("returns a category field error for an unknown category", async () => {
      const instructor = await createUser({ role: "instructor" });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send(newCourseBody({ _id: "507f1f77bcf86cd799439011" }));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Please fix the highlighted fields");
      expect(res.body.errors).toEqual([{ field: "category", message: "Choose a valid category." }]);
    });
  });

  describe("PATCH /api/courses/:id", () => {
    test("owner can update allowed course fields", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        status: "draft",
      });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Course Title",
          price: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Course Title");
      expect(res.body.data.price).toBe(150);
    });

    test("non-owner instructor gets 403", async () => {
      const owner = await createUser({ role: "instructor" });
      const otherInstructor = await createUser({ role: "instructor" });

      const course = await createCourse({
        instructor: owner._id,
      });

      const token = await tokenFor(otherInstructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Another Title" });

      expect(res.status).toBe(403);
    });

    test("returns the contract message for a price above 5,000", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 6000 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "price", message: "Price can't be more than 5,000." },
      ]);
    });

    test("returns a category field error for an unknown category", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ category: "507f1f77bcf86cd799439011" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([{ field: "category", message: "Choose a valid category." }]);
    });
  });

  describe("PATCH /api/courses/:id/status", () => {
    test("cannot publish a course without lessons", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        status: "draft",
      });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "published" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Add at least one lesson before publishing.");
    });

    test("can publish a course with lessons", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        status: "draft",
      });

      await createLessons(course, 1);

      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "published" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("published");
    });

    test("returns the contract message for an unknown status", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/courses/${course._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "archived" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "status", message: "Status must be draft or published." },
      ]);
    });
  });

  describe("DELETE /api/courses/:id", () => {
    test("owner can delete a course with no students", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        studentCount: 0,
      });

      const token = await tokenFor(instructor);

      const res = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      const deleted = await Course.findById(course._id);
      expect(deleted).toBeNull();
    });

    test("cannot delete a course with students", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        studentCount: 1,
      });

      const token = await tokenFor(instructor);

      const res = await request(app)
        .delete(`/api/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("This course has students. Unpublish it instead.");
    });
  });
});
