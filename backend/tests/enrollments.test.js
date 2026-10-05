const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Category = require("../src/models/Category");
const Course = require("../src/models/Course");
const Enrollment = require("../src/models/Enrollment");
const { createUser, tokenFor, createCourse, createLessons } = require("./helpers");

const newId = () => new mongoose.Types.ObjectId();

async function loginAs(role) {
  const user = await createUser({ role });
  return { user, auth: `Bearer ${tokenFor(user)}` };
}

function publishedCourse(overrides = {}) {
  return createCourse({ status: "published", ...overrides });
}

async function studentCountOf(course) {
  return (await Course.findById(course._id)).studentCount;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /api/enrollments", () => {
  function enroll(courseId, auth) {
    const req = request(app).post("/api/enrollments");
    if (auth) req.set("Authorization", auth);
    return req.send({ courseId: String(courseId) });
  }

  it("returns 401 without a token", async () => {
    const course = await publishedCourse();

    const res = await enroll(course._id);

    expect(res.status).toBe(401);
  });

  it("returns 403 for an instructor and an admin", async () => {
    const course = await publishedCourse();

    for (const role of ["instructor", "admin"]) {
      const { auth } = await loginAs(role);
      const res = await enroll(course._id, auth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You don't have permission to do that");
    }
  });

  it("returns 400 when courseId isn't a valid ID", async () => {
    const { auth } = await loginAs("student");

    const res = await enroll("abc", auth);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "courseId", message: "Invalid ID" }]);
  });

  it("returns 404 for an unknown course and for a draft", async () => {
    const { auth } = await loginAs("student");
    const draft = await createCourse();

    for (const courseId of [newId(), draft._id]) {
      const res = await enroll(courseId, auth);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Course not found");
    }
  });

  it("returns 400 for a paid course", async () => {
    const { auth } = await loginAs("student");
    const course = await publishedCourse({ price: 180 });

    const res = await enroll(course._id, auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("This course is paid. Go to checkout.");
    expect(await studentCountOf(course)).toBe(0);
  });

  it("enrolls a student in a free course and adds 1 to studentCount", async () => {
    const { user, auth } = await loginAs("student");
    const course = await publishedCourse();

    const res = await enroll(course._id, auth);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Enrolled successfully");
    expect(res.body.data).toMatchObject({
      user: String(user._id),
      course: String(course._id),
      order: null,
      completedLessons: [],
      progress: 0,
      completedAt: null,
    });
    expect(await studentCountOf(course)).toBe(1);
  });

  it("returns 409 the second time, and counts the student once", async () => {
    const { auth } = await loginAs("student");
    const course = await publishedCourse();
    await enroll(course._id, auth);

    const res = await enroll(course._id, auth);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("You're already enrolled in this course.");
    expect(await Enrollment.countDocuments()).toBe(1);
    expect(await studentCountOf(course)).toBe(1);
  });

  it("still returns 409 when two quick requests both pass the first check", async () => {
    const { auth } = await loginAs("student");
    const course = await publishedCourse();
    await enroll(course._id, auth);

    // The check misses the first enrollment, as it can when two requests arrive together,
    // so the database's unique index has to stop the second one.
    jest.spyOn(Enrollment, "exists").mockResolvedValueOnce(null);
    const res = await enroll(course._id, auth);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("You're already enrolled in this course.");
    expect(await Enrollment.countDocuments()).toBe(1);
    expect(await studentCountOf(course)).toBe(1);
  });
});

describe("GET /api/enrollments/my", () => {
  function getMine(auth) {
    const req = request(app).get("/api/enrollments/my");
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

  it("returns only my enrollments, newest first, with the course details", async () => {
    const { user, auth } = await loginAs("student");
    const classmate = await createUser();
    const instructor = await createUser({ role: "instructor" });
    const design = await Category.create({ name: "Design" });
    const shared = { instructor: instructor._id, category: design._id };
    const older = await publishedCourse({ title: "Logo design basics", ...shared });
    const newer = await publishedCourse({ title: "Brand identity", ...shared });
    await Enrollment.create({ user: user._id, course: older._id });
    await Enrollment.create({ user: user._id, course: newer._id, progress: 50 });
    await Enrollment.create({ user: classmate._id, course: older._id });

    const res = await getMine(auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Enrollments fetched successfully");
    expect(res.body.data.map((enrollment) => enrollment.course.title)).toEqual([
      "Brand identity",
      "Logo design basics",
    ]);

    const [item] = res.body.data;
    expect(Object.keys(item).sort()).toEqual([
      "_id",
      "completedAt",
      "completedLessons",
      "course",
      "createdAt",
      "progress",
    ]);
    expect(item).toMatchObject({ progress: 50, completedAt: null, completedLessons: [] });
    expect(item.course).toEqual({
      _id: String(newer._id),
      title: "Brand identity",
      thumbnailUrl: "",
      lessonCount: 0,
      category: { _id: String(design._id), name: "Design", slug: "design" },
      instructor: { name: instructor.name },
    });
  });

  it("returns an empty list for a student with no enrollments", async () => {
    const { auth } = await loginAs("student");

    const res = await getMine(auth);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe("PATCH /api/enrollments/:courseId/lessons/:lessonId/complete", () => {
  function complete(courseId, lessonId, auth) {
    const req = request(app).patch(`/api/enrollments/${courseId}/lessons/${lessonId}/complete`);
    if (auth) req.set("Authorization", auth);
    return req;
  }

  // A published course with 3 lessons, and a student enrolled in it.
  async function enrolledStudent() {
    const { user, auth } = await loginAs("student");
    const course = await publishedCourse();
    const lessons = await createLessons(course, 3);
    await Enrollment.create({ user: user._id, course: course._id });
    return { auth, course, lessons };
  }

  it("returns 400 when an ID isn't valid", async () => {
    const { auth, course } = await enrolledStudent();

    const res = await complete(course._id, "abc", auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID");
  });

  it("returns 401 without a token", async () => {
    const res = await complete(newId(), newId());

    expect(res.status).toBe(401);
  });

  it("returns 403 for an instructor", async () => {
    const { course, lessons } = await enrolledStudent();
    const { auth } = await loginAs("instructor");

    const res = await complete(course._id, lessons[0]._id, auth);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You don't have permission to do that");
  });

  it("returns 404 for an unknown course", async () => {
    const { auth, lessons } = await enrolledStudent();

    const res = await complete(newId(), lessons[0]._id, auth);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Course not found");
  });

  it("returns 403 for a student who isn't enrolled", async () => {
    const { course, lessons } = await enrolledStudent();
    const { auth } = await loginAs("student");

    const res = await complete(course._id, lessons[0]._id, auth);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Enroll in this course to watch its lessons.");
  });

  it("returns 404 for a lesson from another course", async () => {
    const { auth, course } = await enrolledStudent();
    const [otherLesson] = await createLessons(await publishedCourse(), 1);

    const res = await complete(course._id, otherLesson._id, auth);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Lesson not found");
  });

  it("adds a lesson only once and updates the progress", async () => {
    const { auth, course, lessons } = await enrolledStudent();

    const first = await complete(course._id, lessons[0]._id, auth);
    const again = await complete(course._id, lessons[0]._id, auth);

    expect(first.status).toBe(200);
    expect(first.body.message).toBe("Lesson marked as complete");
    expect(first.body.data).toEqual({
      completedLessons: [String(lessons[0]._id)],
      progress: 33,
      completedAt: null,
    });
    expect(again.status).toBe(200);
    expect(again.body.data).toEqual(first.body.data);
  });

  it("reaches 100 and sets completedAt when every lesson is done", async () => {
    const { auth, course, lessons } = await enrolledStudent();

    const progress = [];
    let last;
    for (const lesson of lessons) {
      last = await complete(course._id, lesson._id, auth);
      progress.push(last.body.data.progress);
    }

    expect(progress).toEqual([33, 67, 100]);
    expect(last.body.data.completedLessons).toHaveLength(3);
    expect(last.body.data.completedAt).toEqual(expect.any(String));

    const saved = await Enrollment.findOne({ course: course._id });
    expect(saved.progress).toBe(100);
    expect(saved.completedAt).toBeInstanceOf(Date);
  });
});
