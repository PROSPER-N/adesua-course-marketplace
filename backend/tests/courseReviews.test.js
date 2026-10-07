const CourseReview = require("../src/models/CourseReview");
const { createUser, createCourse } = require("./helpers");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

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
