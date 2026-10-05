// Shared test helpers. Everyone can reuse these in their own test files.
const User = require("../src/models/User");
const Category = require("../src/models/Category");
const Course = require("../src/models/Course");
const Lesson = require("../src/models/Lesson");
const generateToken = require("../src/utils/generateToken");

const TEST_PASSWORD = "Demo1234";

let userCount = 0;
let courseCount = 0;

// Creates a user in the test database. Every call gets a new email.
// Examples: createUser(), createUser({ role: "instructor" }), createUser({ isActive: false })
async function createUser({ role = "student", isActive = true } = {}) {
  userCount += 1;
  return User.create({
    name: `Test ${role} ${userCount}`,
    email: `${role}${userCount}@test.com`,
    password: TEST_PASSWORD,
    role,
    isActive,
  });
}

// A login token for that user. Send it as: .set("Authorization", `Bearer ${tokenFor(user)}`)
function tokenFor(user) {
  return generateToken(user._id);
}

// Creates a valid course: a free beginner draft unless you pass other values.
// Without an instructor or category, it creates new ones. Pass IDs to share them between courses.
// Examples: createCourse(), createCourse({ instructor: kwame._id, status: "published", price: 180 })
async function createCourse(overrides = {}) {
  courseCount += 1;
  const instructor = overrides.instructor ?? (await createUser({ role: "instructor" }))._id;
  const category =
    overrides.category ?? (await Category.create({ name: `Test category ${courseCount}` }))._id;

  return Course.create({
    title: `Test course ${courseCount}`,
    shortDescription: "A short description for tests.",
    description: "A longer description for tests, at least 20 characters.",
    price: 0,
    level: "beginner",
    ...overrides,
    instructor,
    category,
  });
}

// Adds lessons to the course, in order from 1 and 10 minutes each, and updates the course's
// lessonCount and totalMinutes to match. Returns the lessons in order.
async function createLessons(course, count = 3) {
  const lessons = await Lesson.create(
    Array.from({ length: count }, (_, index) => ({
      course: course._id,
      title: `Lesson ${index + 1}`,
      videoUrl: `https://youtu.be/lesson${index + 1}`,
      content: `Notes for lesson ${index + 1}.`,
      durationMinutes: 10,
      order: index + 1,
    }))
  );
  await Course.updateOne({ _id: course._id }, { lessonCount: count, totalMinutes: count * 10 });
  return lessons;
}

module.exports = { createUser, tokenFor, createCourse, createLessons, TEST_PASSWORD };
