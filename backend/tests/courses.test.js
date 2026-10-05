const request = require("supertest");

const app = require("../src/app");
const { createUser, tokenFor, createCourse, createLessons } = require("./helpers");

const Category = require("../src/models/Category");
const Course = require("../src/models/Course");

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

    test("returns 400 for an invalid filter", async () => {
      const res = await request(app).get("/api/courses").query({ level: "expert" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
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
