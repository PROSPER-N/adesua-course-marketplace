const request = require("supertest");
const app = require("../src/app");
const Category = require("../src/models/Category");
const { createUser, createCourse } = require("./helpers");

describe("GET /api/stats", () => {
  test("is public and returns counts for published courses, eligible instructors, learners and all categories", async () => {
    const publishedInstructor = await createUser({ role: "instructor" });
    const draftInstructor = await createUser({ role: "instructor" });
    await createUser({ role: "student" });
    await createUser({ role: "student" });
    const category = await Category.create({ name: "Published category" });
    await Category.create({ name: "Unused category" });

    await createCourse({
      instructor: publishedInstructor._id,
      category: category._id,
      status: "published",
    });
    await createCourse({
      instructor: draftInstructor._id,
      category: category._id,
      status: "draft",
    });

    const res = await request(app).get("/api/stats");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: "Stats fetched successfully",
      data: { courses: 1, instructors: 1, learners: 2, categories: 2 },
    });
    expect(Object.keys(res.body.data).sort()).toEqual([
      "categories",
      "courses",
      "instructors",
      "learners",
    ]);
  });

  test("does not count draft courses or instructors who only have drafts", async () => {
    const instructor = await createUser({ role: "instructor" });
    await createCourse({ instructor: instructor._id, status: "draft" });

    const res = await request(app).get("/api/stats");

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ courses: 0, instructors: 0 });
  });
});
