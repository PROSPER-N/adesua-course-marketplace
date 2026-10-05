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
          videoUrl: "https://youtu.be/example123",
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
      expect(res.body.message).toBe("Add a video or lesson notes.");
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
          videoUrl: "https://youtu.be/example123",
          durationMinutes: 10,
        });

      expect(res.status).toBe(403);
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
  });
});
