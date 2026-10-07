const SiteReview = require("../src/models/SiteReview");
const { createUser } = require("./helpers");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

describe("SiteReview model", () => {
  async function reviewData(overrides = {}) {
    const user = await createUser();
    return { user: user._id, rating: 5, comment: "Easy to find a course and start.", ...overrides };
  }

  it("allows one platform review per account", async () => {
    const data = await reviewData();
    await SiteReview.create(data);

    await expect(SiteReview.create({ ...data, rating: 3 })).rejects.toMatchObject({
      code: 11000,
    });
  });

  it.each([0, 6, 4.5])("refuses a rating of %s", async (rating) => {
    await expect(SiteReview.create(await reviewData({ rating }))).rejects.toMatchObject({
      name: "ValidationError",
      errors: { rating: expect.objectContaining({ message: RATING_MSG }) },
    });
  });

  it("refuses a comment under 10 characters", async () => {
    await expect(SiteReview.create(await reviewData({ comment: "Nice." }))).rejects.toMatchObject({
      name: "ValidationError",
      errors: { comment: expect.objectContaining({ message: COMMENT_MSG }) },
    });
  });
});
