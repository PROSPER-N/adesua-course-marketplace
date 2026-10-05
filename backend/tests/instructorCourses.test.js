const request = require("supertest");

const app = require("../src/app");
const {
  createUser,
  tokenFor,
  createCourse,
  createLessons,
} = require("./helpers");

describe("Instructor Courses API", () => {
  describe("GET /api/instructor/courses", () => {
    test("instructor can get their own courses", async () => {
      const instructor = await createUser({ role: "instructor" });
      const otherInstructor = await createUser({ role: "instructor" });

      const firstCourse = await createCourse({
        instructor: instructor._id,
        title: "First Course",
      });

      const secondCourse = await createCourse({
        instructor: instructor._id,
        title: "Second Course",
      });

      await createCourse({
        instructor: otherInstructor._id,
        title: "Other Instructor Course",
      });

      const token = await tokenFor(instructor);

      const res = await request(app)
        .get("/api/instructor/courses")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);

      const returnedIds = res.body.data.map((course) =>
        course._id.toString(),
      );

      expect(returnedIds).toContain(firstCourse._id.toString());
      expect(returnedIds).toContain(secondCourse._id.toString());

      expect(
        res.body.data.every(
          (course) =>
            course.instructor.toString() === instructor._id.toString(),
        ),
      ).toBe(true);
    });

    test("requires instructor authentication", async () => {
      const res = await request(app).get("/api/instructor/courses");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/instructor/courses/:id", () => {
    test("owner can get full course details including lesson content", async () => {
      const instructor = await createUser({ role: "instructor" });

      const course = await createCourse({
        instructor: instructor._id,
        title: "Complete Course",
        lessonCount: 2,
        totalMinutes: 20,
      });

      const lessons = await createLessons(course, 2);
      const token = await tokenFor(instructor);

      const res = await request(app)
        .get(`/api/instructor/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(course._id.toString());
      expect(res.body.data.title).toBe("Complete Course");
      expect(res.body.data.lessons).toHaveLength(2);

      expect(res.body.data.lessons[0]._id.toString()).toBe(
        lessons[0]._id.toString(),
      );

      expect(res.body.data.lessons[0].videoUrl).toBe(
        "https://youtu.be/lesson1",
      );

      expect(res.body.data.lessons[0].content).toBe(
        "Notes for lesson 1.",
      );
    });

    test("non-owner instructor cannot access another instructor's course", async () => {
      const owner = await createUser({ role: "instructor" });
      const otherInstructor = await createUser({ role: "instructor" });

      const course = await createCourse({
        instructor: owner._id,
      });

      const token = await tokenFor(otherInstructor);

      const res = await request(app)
        .get(`/api/instructor/courses/${course._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("unknown course returns 404", async () => {
      const instructor = await createUser({ role: "instructor" });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .get("/api/instructor/courses/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});