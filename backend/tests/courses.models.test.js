const mongoose = require("mongoose");
const Course = require("../src/models/Course");
const Lesson = require("../src/models/Lesson");

// The models don't look up the instructor, category or course, so fresh IDs are enough here.
const newId = () => new mongoose.Types.ObjectId();

function courseData(overrides = {}) {
  return {
    title: "Build your first website",
    shortDescription: "Go from an empty folder to a live page.",
    description: "Learn HTML and CSS by building and publishing a small website.",
    instructor: newId(),
    category: newId(),
    price: 0,
    level: "beginner",
    ...overrides,
  };
}

describe("Course model", () => {
  it("fails validation without a title", async () => {
    await expect(Course.create(courseData({ title: undefined }))).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        title: expect.objectContaining({ message: "Title must be between 5 and 120 characters." }),
      },
    });
  });

  it("fails validation when the price is negative", async () => {
    await expect(Course.create(courseData({ price: -1 }))).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        price: expect.objectContaining({
          message: "Price can't be negative. Enter 0 for a free course.",
        }),
      },
    });
  });

  it("saves a valid course as a draft, with the counts at 0", async () => {
    const course = await Course.create(courseData());

    expect(course.status).toBe("draft");
    expect(course.lessonCount).toBe(0);
    expect(course.totalMinutes).toBe(0);
    expect(course.studentCount).toBe(0);
    expect(course.thumbnailUrl).toBe("");
    expect(course.whatYouWillLearn).toHaveLength(0);
  });

  it("fails validation with more than 6 things to learn", async () => {
    const whatYouWillLearn = Array.from({ length: 7 }, (_, index) => `Skill ${index + 1}`);

    await expect(Course.create(courseData({ whatYouWillLearn }))).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        whatYouWillLearn: expect.objectContaining({
          message: "List up to 6 things students will learn.",
        }),
      },
    });
  });
});

describe("Lesson model", () => {
  it("fails validation when durationMinutes is 0", async () => {
    await expect(
      Lesson.create({ course: newId(), title: "Welcome", durationMinutes: 0, order: 1 })
    ).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        durationMinutes: expect.objectContaining({
          message: "Enter the length in minutes (1 to 300).",
        }),
      },
    });
  });
});
