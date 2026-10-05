// Owner: Member C
// Enrolls the three demo students in published courses, for free or through a paid order,
// at different stages, so My learning, the purchase history and the stats have data to show.
const Course = require("../../src/models/Course");
const Enrollment = require("../../src/models/Enrollment");
const Lesson = require("../../src/models/Lesson");
const Order = require("../../src/models/Order");
const generateReference = require("../../src/utils/generateReference");
const { calculateProgress } = require("../../src/services/enrollment.service");

// "users" and "courses" are the documents created by the earlier seeders.
// Returns the created enrollments.
async function seedEnrollments({ users, courses }) {
  const published = courses.filter((course) => course.status === "published");
  if (published.length === 0) return [];

  const free = published.filter((course) => course.price === 0);
  const paid = published.filter((course) => course.price > 0);
  const [akosua, kojo, esi] = users.filter((user) => user.role === "student");

  // share is how much of the course is done:
  // - Akosua: a free course finished, and a paid course about halfway
  // - Kojo: a free course just started, and a paid course not started yet
  // - Esi: a paid course finished
  // When there's a second free or paid course, Kojo gets it, so the courses vary.
  // Anything that would need a missing course is skipped.
  const plan = [
    { student: akosua, course: free[0], share: 1 },
    { student: akosua, course: paid[0], share: 0.5, paymentMethod: "momo" },
    { student: kojo, course: free[1] ?? free[0], share: 0.25 },
    { student: kojo, course: paid[1] ?? paid[0], share: 0, paymentMethod: "card" },
    { student: esi, course: paid[0], share: 1, paymentMethod: "momo" },
  ].filter(({ student, course }) => student && course);

  const enrollments = [];
  for (const { student, course, share, paymentMethod } of plan) {
    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 }).select("_id");
    const completedLessons = lessons
      .slice(0, Math.round(share * lessons.length))
      .map((lesson) => lesson._id);
    // lessons.length, not course.lessonCount: a course document can be saved before its lessons.
    const progress = calculateProgress(completedLessons.length, lessons.length);

    // A paid course is bought first, the same way checkout works.
    let order = null;
    if (course.price > 0) {
      order = await Order.create({
        user: student._id,
        course: course._id,
        amount: course.price,
        paymentMethod,
        status: "paid",
        reference: generateReference(),
        paidAt: new Date(),
      });
    }

    enrollments.push(
      await Enrollment.create({
        user: student._id,
        course: course._id,
        order: order?._id ?? null,
        completedLessons,
        progress,
        completedAt: progress === 100 ? new Date() : null,
      })
    );
    // Each enrollment adds one student, the same as enrolling through the API.
    await Course.updateOne({ _id: course._id }, { $inc: { studentCount: 1 } });
  }

  return enrollments;
}

module.exports = seedEnrollments;
