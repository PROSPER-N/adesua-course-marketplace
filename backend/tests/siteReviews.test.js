const request = require("supertest");
const app = require("../src/app");
const SiteReview = require("../src/models/SiteReview");
const { createUser, tokenFor } = require("./helpers");

const RATING_MSG = "Choose a rating from 1 to 5.";
const COMMENT_MSG = "Write between 10 and 1000 characters.";

const validReview = { rating: 4, comment: "Easy to find a course and start." };

const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

// A visible platform review by a new student. Overrides change any field.
async function addReview(overrides = {}) {
  const user = await createUser();
  return SiteReview.create({ user: user._id, ...validReview, ...overrides });
}

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

describe("GET /api/reviews", () => {
  it("lists visible reviews, newest first, with a summary", async () => {
    await addReview({ rating: 5, comment: "The first review of the site." });
    await addReview({ rating: 2, isHidden: true, comment: "A hidden review here." });
    await addReview({ rating: 4, comment: "The newest review of the site." });

    const res = await request(app).get("/api/reviews");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reviews fetched successfully");
    expect(res.body.data.items.map((item) => item.comment)).toEqual([
      "The newest review of the site.",
      "The first review of the site.",
    ]);
    expect(Object.keys(res.body.data.items[0]).sort()).toEqual([
      "_id",
      "comment",
      "createdAt",
      "rating",
      "updatedAt",
      "user",
    ]);
    expect(Object.keys(res.body.data.items[0].user).sort()).toEqual(["_id", "name", "role"]);
    expect(res.body.data.summary).toEqual({
      average: 4.5,
      count: 2,
      breakdown: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 },
    });
  });

  it("pages through the reviews", async () => {
    for (let i = 0; i < 3; i++) await addReview();

    const res = await request(app).get("/api/reviews").query({ limit: 2, page: 2 });

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.pagination).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("returns an empty list and a zero summary when there are no reviews", async () => {
    const res = await request(app).get("/api/reviews");

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.summary).toMatchObject({ average: 0, count: 0 });
  });

  it("returns 400 for a bad limit", async () => {
    const res = await request(app).get("/api/reviews").query({ limit: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "limit", message: "Page and limit must be positive numbers." },
    ]);
  });
});

describe("My platform review: /api/reviews/mine", () => {
  it("needs a logged-in student or instructor for every method", async () => {
    const admin = await createUser({ role: "admin" });

    for (const method of ["get", "put", "delete"]) {
      const guest = await request(app)[method]("/api/reviews/mine").send(validReview);
      expect(guest.status).toBe(401);
      expect(guest.body.message).toBe("Please log in to continue");

      const res = await request(app)
        [method]("/api/reviews/mine")
        .set(authHeader(admin))
        .send(validReview);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You don't have permission to do that");
    }
  });

  it.each(["student", "instructor"])(
    "lets a %s create, update, read and delete one review",
    async (role) => {
      const user = await createUser({ role });

      const created = await request(app)
        .put("/api/reviews/mine")
        .set(authHeader(user))
        .send(validReview);
      const updated = await request(app)
        .put("/api/reviews/mine")
        .set(authHeader(user))
        .send({ rating: 5, comment: "  Even better after a month of lessons.  " });
      const read = await request(app).get("/api/reviews/mine").set(authHeader(user));
      const deleted = await request(app).delete("/api/reviews/mine").set(authHeader(user));
      const afterDelete = await request(app).get("/api/reviews/mine").set(authHeader(user));

      expect(created.status).toBe(201);
      expect(created.body.message).toBe("Review created successfully");
      expect(updated.status).toBe(200);
      expect(updated.body.message).toBe("Review updated successfully");
      expect(read.body.message).toBe("Review fetched successfully");
      expect(read.body.data).toMatchObject({
        rating: 5,
        comment: "Even better after a month of lessons.",
        isHidden: false,
      });
      expect(deleted.status).toBe(200);
      expect(deleted.body.message).toBe("Review deleted successfully");
      expect(afterDelete.body.data).toBeNull();
    }
  );

  it("keeps one review per account", async () => {
    const user = await createUser();

    await request(app).put("/api/reviews/mine").set(authHeader(user)).send(validReview);
    await request(app)
      .put("/api/reviews/mine")
      .set(authHeader(user))
      .send({ ...validReview, rating: 1 });

    expect(await SiteReview.countDocuments({ user: user._id })).toBe(1);
  });

  it.each([0, 6, 4.5, "4", null])("refuses %p as a rating", async (rating) => {
    const user = await createUser();

    const res = await request(app)
      .put("/api/reviews/mine")
      .set(authHeader(user))
      .send({ ...validReview, rating });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "rating", message: RATING_MSG }]);
  });

  it.each([
    ["9 characters once trimmed", "  Too short  "],
    ["1001 characters", "a".repeat(1001)],
    ["no comment", undefined],
  ])("refuses a comment with %s", async (_, comment) => {
    const user = await createUser();

    const res = await request(app)
      .put("/api/reviews/mine")
      .set(authHeader(user))
      .send({ ...validReview, comment });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "comment", message: COMMENT_MSG }]);
  });

  it("keeps a hidden review hidden when it's edited", async () => {
    const user = await createUser();
    await SiteReview.create({ user: user._id, ...validReview, isHidden: true });

    const res = await request(app)
      .put("/api/reviews/mine")
      .set(authHeader(user))
      .send({ ...validReview, rating: 5, isHidden: false });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ rating: 5, isHidden: true });
  });

  it("returns 404 when there's no review to delete", async () => {
    const user = await createUser();

    const res = await request(app).delete("/api/reviews/mine").set(authHeader(user));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Review not found");
  });
});
