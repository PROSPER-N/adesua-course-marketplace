const request = require("supertest");

const app = require("../src/app");
const { createUser, tokenFor, createCourse, createLessons } = require("./helpers");

const Course = require("../src/models/Course");
const Lesson = require("../src/models/Lesson");
const Enrollment = require("../src/models/Enrollment");

describe("Lessons API", () => {
  describe("POST /api/courses/:id/lessons", () => {
    test("course owner can create a lesson and counters update", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        lessonCount: 0,
        totalMinutes: 0,
      });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .post(`/api/courses/${course._id}/lessons`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Introduction to the Course",
          videoUrl: "https://youtu.be/jNQXAC9IVRw",
          content: "These are the lesson notes.",
          durationMinutes: 25,
          isPreview: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Lesson created successfully");
      expect(res.body.data.title).toBe("Introduction to the Course");
      expect(res.body.data.order).toBe(1);

      const updatedCourse = await Course.findById(course._id);

      expect(updatedCourse.lessonCount).toBe(1);
      expect(updatedCourse.totalMinutes).toBe(25);
    });

    test("rejects a lesson with neither video nor content", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
      });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .post(`/api/courses/${course._id}/lessons`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Empty Lesson",
          durationMinutes: 10,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Add a YouTube link, lesson notes, or both.");
    });

    test("ignores fields the server sets, like _id and course", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const otherCourse = await createCourse();
      const token = await tokenFor(instructor);
      const chosenId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .post(`/api/courses/${course._id}/lessons`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Introduction to the Course",
          content: "These are the lesson notes.",
          durationMinutes: 10,
          _id: chosenId,
          createdAt: "2030-01-01T00:00:00.000Z",
          course: otherCourse._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.data._id).not.toBe(chosenId);
      expect(res.body.data.course).toBe(course._id.toString());
      expect(new Date(res.body.data.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
      expect(await Lesson.findById(chosenId)).toBeNull();
    });

    test("non-owner instructor cannot create a lesson", async () => {
      const owner = await createUser({ role: "instructor" });
      const otherInstructor = await createUser({ role: "instructor" });

      const course = await createCourse({
        instructor: owner._id,
      });

      const token = await tokenFor(otherInstructor);

      const res = await request(app)
        .post(`/api/courses/${course._id}/lessons`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Unauthorized Lesson",
          videoUrl: "https://youtu.be/jNQXAC9IVRw",
          durationMinutes: 10,
        });

      expect(res.status).toBe(403);
    });

    test("accepts the YouTube links the lesson player can play", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);
      const links = [
        "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "https://youtu.be/jNQXAC9IVRw",
        "https://www.youtube.com/embed/jNQXAC9IVRw",
        "https://m.youtube.com/watch?v=jNQXAC9IVRw",
      ];

      for (const videoUrl of links) {
        const res = await request(app)
          .post(`/api/courses/${course._id}/lessons`)
          .set("Authorization", `Bearer ${token}`)
          .send({ title: "Watch this first", videoUrl, durationMinutes: 5 });

        expect(res.status).toBe(201);
      }
    });

    test("returns the contract message for any other link", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);
      const links = [
        "https://vimeo.com/76979871",
        "https://www.youtube.com/playlist?list=PL123",
        "https://youtu.be/short",
        "javascript://www.youtube.com/watch?v=jNQXAC9IVRw",
      ];

      for (const videoUrl of links) {
        const res = await request(app)
          .post(`/api/courses/${course._id}/lessons`)
          .set("Authorization", `Bearer ${token}`)
          .send({ title: "Watch this first", videoUrl, durationMinutes: 5 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual([{ field: "videoUrl", message: "Use a YouTube link." }]);
      }
    });

    test("returns the contract message for a length outside 1 to 300 minutes", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .post(`/api/courses/${course._id}/lessons`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Too short", content: "Notes.", durationMinutes: 0 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "durationMinutes", message: "Enter the length in minutes (1 to 300)." },
      ]);
    });

    test("uses the model's message for an order below 1", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const token = await tokenFor(instructor);

      const res = await request(app)
        .post(`/api/courses/${course._id}/lessons`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Out of order", content: "Notes.", durationMinutes: 5, order: 0 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "order", message: "Lesson order must be a whole number of 1 or more." },
      ]);
    });
  });

  describe("PATCH /api/lessons/:id", () => {
    test("course owner can update a lesson and duration adjusts totalMinutes", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        lessonCount: 1,
        totalMinutes: 10,
      });
      const [lesson] = await createLessons(course, 1);
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Lesson",
          durationMinutes: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Lesson");
      expect(res.body.data.durationMinutes).toBe(30);

      const updatedCourse = await Course.findById(course._id);

      expect(updatedCourse.totalMinutes).toBe(30);
    });

    test("non-owner instructor cannot update a lesson", async () => {
      const owner = await createUser({ role: "instructor" });
      const otherInstructor = await createUser({ role: "instructor" });

      const course = await createCourse({
        instructor: owner._id,
      });
      const [lesson] = await createLessons(course, 1);

      const token = await tokenFor(otherInstructor);

      const res = await request(app)
        .patch(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Unauthorized Update",
        });

      expect(res.status).toBe(403);
    });

    test("admin cannot update a lesson", async () => {
      const course = await createCourse();
      const [lesson] = await createLessons(course, 1);
      const admin = await createUser({ role: "admin" });
      const token = await tokenFor(admin);

      const res = await request(app)
        .patch(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Admin Update",
        });

      expect(res.status).toBe(403);
      expect((await Lesson.findById(lesson._id)).title).toBe("Lesson 1");
    });

    test("returns the contract message for a length over 300 minutes", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const [lesson] = await createLessons(course, 1);
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ durationMinutes: 301 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual([
        { field: "durationMinutes", message: "Enter the length in minutes (1 to 300)." },
      ]);
    });

    test("cannot remove both the video and the notes", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({ instructor: instructor._id });
      const [lesson] = await createLessons(course, 1);
      const token = await tokenFor(instructor);

      const res = await request(app)
        .patch(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ videoUrl: "", content: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Add a YouTube link, lesson notes, or both.");
      expect((await Lesson.findById(lesson._id)).content).toBe("Notes for lesson 1.");
    });
  });

  describe("DELETE /api/lessons/:id", () => {
    test("deleting a lesson updates counters", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        lessonCount: 2,
        totalMinutes: 20,
      });
      const lessons = await createLessons(course, 2);
      const token = await tokenFor(instructor);

      const res = await request(app)
        .delete(`/api/lessons/${lessons[0]._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      const updatedCourse = await Course.findById(course._id);

      expect(updatedCourse.lessonCount).toBe(1);
      expect(updatedCourse.totalMinutes).toBe(10);
      expect(await Lesson.findById(lessons[0]._id)).toBeNull();
    });

    test("deleting a lesson removes it from completedLessons", async () => {
      const instructor = await createUser({ role: "instructor" });
      const student = await createUser({ role: "student" });

      const course = await createCourse({
        instructor: instructor._id,
        lessonCount: 2,
        totalMinutes: 20,
      });

      const lessons = await createLessons(course, 2);

      await Enrollment.create({
        user: student._id,
        course: course._id,
        completedLessons: [lessons[0]._id, lessons[1]._id],
        progress: 100,
      });

      const token = await tokenFor(instructor);

      const res = await request(app)
        .delete(`/api/lessons/${lessons[0]._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      const enrollment = await Enrollment.findOne({
        user: student._id,
        course: course._id,
      });

      expect(enrollment.completedLessons.map(String)).toEqual([lessons[1]._id.toString()]);
    });

    test("cannot delete the last lesson from a published course", async () => {
      const instructor = await createUser({ role: "instructor" });
      const course = await createCourse({
        instructor: instructor._id,
        status: "published",
        lessonCount: 1,
        totalMinutes: 10,
      });

      const [lesson] = await createLessons(course, 1);
      const token = await tokenFor(instructor);

      const res = await request(app)
        .delete(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "A published course needs at least one lesson. Unpublish it first."
      );
    });

    test("admin cannot delete a lesson", async () => {
      const course = await createCourse();
      const [lesson] = await createLessons(course, 1);
      const admin = await createUser({ role: "admin" });
      const token = await tokenFor(admin);

      const res = await request(app)
        .delete(`/api/lessons/${lesson._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(await Lesson.findById(lesson._id)).not.toBeNull();
    });
  });
});
