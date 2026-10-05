const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Course = require("../src/models/Course");
const Enrollment = require("../src/models/Enrollment");
const Lesson = require("../src/models/Lesson");
const { createUser, tokenFor, createCourse, createLessons } = require("./helpers");

const newId = () => new mongoose.Types.ObjectId();

async function loginAs(role) {
  const user = await createUser({ role });
  return { user, auth: `Bearer ${tokenFor(user)}` };
}

function getLessons(courseId, auth) {
  const req = request(app).get(`/api/courses/${courseId}/lessons`);
  if (auth) req.set("Authorization", auth);
  return req;
}

describe("GET /api/courses/:id/lessons", () => {
  it("returns 400 for an invalid ID", async () => {
    const { auth } = await loginAs("student");

    const res = await getLessons("abc", auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID");
  });

  it("returns 401 without a token", async () => {
    const course = await createCourse({ status: "published" });

    const res = await getLessons(course._id);

    expect(res.status).toBe(401);
  });

  it("returns 404 for an unknown course", async () => {
    const { auth } = await loginAs("student");

    const res = await getLessons(newId(), auth);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Course not found");
  });

  it("returns 403 for a student who isn't enrolled and for another instructor", async () => {
    const course = await createCourse({ status: "published" });
    await createLessons(course, 2);

    for (const role of ["student", "instructor"]) {
      const { auth } = await loginAs(role);
      const res = await getLessons(course._id, auth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Enroll in this course to watch its lessons.");
    }
  });

  it("gives an enrolled student the full lessons in order, with their progress", async () => {
    const { user, auth } = await loginAs("student");
    const course = await createCourse({ status: "published", title: "Intro to React" });
    // Saved out of order, so the test shows the sort by "order".
    await Lesson.create({
      course: course._id,
      title: "Components and props",
      videoUrl: "https://youtu.be/lesson2",
      content: "Notes for lesson 2.",
      durationMinutes: 12,
      order: 2,
    });
    const firstLesson = await Lesson.create({
      course: course._id,
      title: "Welcome",
      videoUrl: "https://youtu.be/lesson1",
      content: "Notes for lesson 1.",
      durationMinutes: 8,
      order: 1,
    });
    await Course.updateOne({ _id: course._id }, { lessonCount: 2, totalMinutes: 20 });
    await Enrollment.create({
      user: user._id,
      course: course._id,
      completedLessons: [firstLesson._id],
      progress: 50,
    });

    const res = await getLessons(course._id, auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Lessons fetched successfully");
    expect(res.body.data.course).toEqual({
      _id: String(course._id),
      title: "Intro to React",
      lessonCount: 2,
    });
    expect(res.body.data.lessons.map((lesson) => lesson.title)).toEqual([
      "Welcome",
      "Components and props",
    ]);
    expect(res.body.data.lessons[0]).toMatchObject({
      _id: String(firstLesson._id),
      videoUrl: "https://youtu.be/lesson1",
      content: "Notes for lesson 1.",
      durationMinutes: 8,
      order: 1,
      isPreview: false,
    });
    expect(res.body.data.lessons[0]).not.toHaveProperty("__v");
    expect(res.body.data.enrollment).toEqual({
      completedLessons: [String(firstLesson._id)],
      progress: 50,
    });
  });

  it("gives the course's instructor and an admin the lessons, with no enrollment", async () => {
    const owner = await createUser({ role: "instructor" });
    const course = await createCourse({ status: "published", instructor: owner._id });
    await createLessons(course, 3);
    const { auth: adminAuth } = await loginAs("admin");

    for (const auth of [`Bearer ${tokenFor(owner)}`, adminAuth]) {
      const res = await getLessons(course._id, auth);

      expect(res.status).toBe(200);
      expect(res.body.data.lessons).toHaveLength(3);
      expect(res.body.data.enrollment).toBeNull();
    }
  });

  it("lets the instructor open their own draft", async () => {
    const owner = await createUser({ role: "instructor" });
    const draft = await createCourse({ instructor: owner._id });
    await createLessons(draft, 1);

    const res = await getLessons(draft._id, `Bearer ${tokenFor(owner)}`);

    expect(res.status).toBe(200);
    expect(res.body.data.lessons).toHaveLength(1);
  });
});
