// Owner: Member A
// Demo reviews written by the demo accounts. A course review is added only when that student
// is enrolled in that course, the same rule the API follows.
const CourseReview = require("../../src/models/CourseReview");
const SiteReview = require("../../src/models/SiteReview");
const { recalculateCourseRating } = require("../../src/services/review.service");

const COURSE_REVIEWS = [
  {
    email: "akosua@example.com",
    course: "Build Your First Web Page",
    courseRating: 5,
    instructorRating: 5,
    comment:
      "I had never written HTML before this course. By the last lesson I had a simple page for my side business online, and every step made sense.",
  },
  {
    email: "akosua@example.com",
    course: "JavaScript Foundations for Beginners",
    courseRating: 4,
    instructorRating: 5,
    comment:
      "The lessons on functions finally made things click for me. I'm halfway through and would like a few more practice exercises between lessons.",
  },
  {
    email: "kojo@example.com",
    course: "Design Principles for Everyday Creatives",
    courseRating: 4,
    instructorRating: 4,
    comment:
      "Short, clear lessons. The part on spacing and contrast already changed how I lay out the flyers for my shop.",
  },
  {
    email: "esi@example.com",
    course: "JavaScript Foundations for Beginners",
    courseRating: 3,
    instructorRating: 4,
    comment:
      "A solid start, but the second half moves fast. I had to rewatch the lessons on arrays twice before the exercises worked.",
  },
];

const SITE_REVIEWS = [
  {
    email: "akosua@example.com",
    rating: 5,
    comment:
      "I signed up, found a course and started the first lesson in a few minutes. Picking up where I stopped on my phone works really well.",
  },
  {
    email: "esi@example.com",
    rating: 4,
    comment:
      "The lessons are short enough to finish on a lunch break. I'd love to see more advanced programming courses.",
  },
  {
    email: "kwame@example.com",
    rating: 5,
    comment:
      "Publishing a course was straightforward. I add lessons as I record them, and I can see how many students joined each one.",
  },
];

// "users", "courses" and "enrollments" are the documents created by the earlier seeders.
// Returns the created reviews.
async function seedReviews({ users, courses, enrollments }) {
  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const courseByTitle = new Map(courses.map((course) => [course.title, course]));
  const isEnrolled = (user, course) =>
    enrollments.some(
      (enrollment) => enrollment.user.equals(user._id) && enrollment.course.equals(course._id)
    );

  const courseReviews = [];
  for (const { email, course: title, ...review } of COURSE_REVIEWS) {
    const user = userByEmail.get(email);
    const course = courseByTitle.get(title);
    // Skipped if the demo data changes and the student isn't enrolled any more.
    if (!user || !course || !isEnrolled(user, course)) continue;
    courseReviews.push(
      await CourseReview.create({ user: user._id, course: course._id, ...review })
    );
  }

  const siteReviews = [];
  for (const { email, ...review } of SITE_REVIEWS) {
    const user = userByEmail.get(email);
    if (user) siteReviews.push(await SiteReview.create({ user: user._id, ...review }));
  }

  // The reviewed courses get their stored rating, so the course list matches the reviews.
  const reviewedCourseIds = new Set(courseReviews.map((review) => String(review.course)));
  for (const courseId of reviewedCourseIds) {
    await recalculateCourseRating(courseId);
  }

  return [...courseReviews, ...siteReviews];
}

module.exports = seedReviews;
