// Rules shared by free enrollment, paying an order, the lesson player and the demo seed,
// so they work the same way everywhere.

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const AppError = require("../utils/AppError");

const ALREADY_ENROLLED = "You're already enrolled in this course.";
const NOT_ENROLLED = "Enroll in this course to watch its lessons.";

// Free enrollment and checkout only work for published courses.
// A draft gets the same 404 as a course that doesn't exist.
async function findPublishedCourse(courseId) {
  const course = await Course.findOne({ _id: courseId, status: "published" });
  if (!course) {
    throw new AppError("Course not found", 404);
  }
  return course;
}

function isEnrolled(userId, courseId) {
  return Enrollment.exists({ user: userId, course: courseId });
}

// Creates the enrollment and adds 1 to the course's studentCount. user, course and order are IDs.
async function enrollStudent({ user, course, order = null }) {
  let enrollment;
  try {
    enrollment = await Enrollment.create({ user, course, order });
  } catch (error) {
    // Two quick requests can both pass the isEnrolled() check. The unique index on
    // { user, course } stops the second one, and this gives it the usual 409.
    if (error.code === 11000) {
      throw new AppError(ALREADY_ENROLLED, 409);
    }
    throw error;
  }

  await Course.updateOne({ _id: course }, { $inc: { studentCount: 1 } });
  return enrollment;
}

// progress = round(completed / lessonCount × 100). It's capped at 100, because a lesson can be
// deleted after a student completed it, and then completed is more than lessonCount.
function calculateProgress(completedCount, lessonCount) {
  if (lessonCount <= 0) return 0;
  return Math.min(100, Math.round((completedCount / lessonCount) * 100));
}

module.exports = {
  ALREADY_ENROLLED,
  NOT_ENROLLED,
  findPublishedCourse,
  isEnrolled,
  enrollStudent,
  calculateProgress,
};
