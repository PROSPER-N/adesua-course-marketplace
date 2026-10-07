const Course = require("../src/models/Course");
const CourseReview = require("../src/models/CourseReview");
const { recalculateCourseRating } = require("../src/services/review.service");
const { createUser, createCourse } = require("./helpers");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

// A visible review of the course by a new student. Overrides change any field.
async function addReview(course, overrides = {}) {
  const student = await createUser();
  return CourseReview.create({
    user: student._id,
    course: course._id,
    courseRating: 5,
    instructorRating: 5,
    comment: "Clear lessons and useful examples.",
    ...overrides,
  });
}

describe("CourseReview model", () => {
  async function reviewData(overrides = {}) {
    const student = await createUser();
    const course = await createCourse({ status: "published" });
    return {
      user: student._id,
      course: course._id,
      courseRating: 5,
      instructorRating: 4,
      comment: "Clear lessons and useful examples.",
      ...overrides,
    };
  }

  it("allows one review per student per course", async () => {
    const data = await reviewData();
    await CourseReview.create(data);

    await expect(CourseReview.create(data)).rejects.toMatchObject({ code: 11000 });
  });

  it.each([0, 6, 4.5])("refuses a rating of %s", async (rating) => {
    const data = await reviewData({ courseRating: rating, instructorRating: rating });

    await expect(CourseReview.create(data)).rejects.toMatchObject({
      name: "ValidationError",
      errors: {
        courseRating: expect.objectContaining({ message: RATING_MSG }),
        instructorRating: expect.objectContaining({ message: RATING_MSG }),
      },
    });
  });

  it.each([
    ["under 10 characters once trimmed", "   Too short   "],
    ["over 1000 characters", "a".repeat(1001)],
  ])("refuses a comment %s", async (_, comment) => {
    const data = await reviewData({ comment });

    await expect(CourseReview.create(data)).rejects.toMatchObject({
      name: "ValidationError",
      errors: { comment: expect.objectContaining({ message: COMMENT_MSG }) },
    });
  });

  it("starts visible", async () => {
    const review = await CourseReview.create(await reviewData());

    expect(review.isHidden).toBe(false);
  });
});

describe("recalculateCourseRating", () => {
  it("stores the average of the visible reviews, rounded to 1 decimal", async () => {
    const course = await createCourse({ status: "published" });
    await addReview(course, { courseRating: 5 });
    await addReview(course, { courseRating: 4 });
    await addReview(course, { courseRating: 4 });
    await addReview(course, { courseRating: 1, isHidden: true });

    await recalculateCourseRating(course._id);

    // (5 + 4 + 4) / 3 = 4.33…, and the hidden 1 doesn't count.
    const saved = await Course.findById(course._id).lean();
    expect(saved.ratingAverage).toBe(4.3);
    expect(saved.ratingCount).toBe(3);
  });

  it("goes back to 0 when no visible reviews are left", async () => {
    const course = await createCourse({ status: "published" });
    await Course.updateOne({ _id: course._id }, { ratingAverage: 4, ratingCount: 1 });
    await addReview(course, { isHidden: true });

    await recalculateCourseRating(course._id);

    const saved = await Course.findById(course._id).lean();
    expect(saved).toMatchObject({ ratingAverage: 0, ratingCount: 0 });
  });

  it("starts every new course at 0", async () => {
    const course = await createCourse();

    expect(course).toMatchObject({ ratingAverage: 0, ratingCount: 0 });
  });
});
