const request = require("supertest");
const app = require("../src/app");
const Category = require("../src/models/Category");
const CourseReview = require("../src/models/CourseReview");
const User = require("../src/models/User");
const { createUser, createCourse } = require("./helpers");

// An instructor with a headline and teaching area, like the ones sign-up creates.
async function createInstructor({ isActive = true, headline = "Web developer and teacher" } = {}) {
  const instructor = await createUser({ role: "instructor", isActive });
  const area = await Category.create({ name: `Area ${instructor.email}` });
  await User.updateOne({ _id: instructor._id }, { headline, teachingArea: area._id });
  return instructor;
}

// A published course by the instructor, with one visible review per instructor rating given.
async function publishWithReviews(instructor, instructorRatings = []) {
  const course = await createCourse({ instructor: instructor._id, status: "published" });
  for (const instructorRating of instructorRatings) {
    const student = await createUser();
    await CourseReview.create({
      user: student._id,
      course: course._id,
      courseRating: 4,
      instructorRating,
      comment: "Clear lessons and useful examples.",
    });
  }
  return course;
}

describe("GET /api/instructors", () => {
  it("is public and lists instructors with published courses, with only public fields", async () => {
    const instructor = await createInstructor();
    await publishWithReviews(instructor, [5]);
    await createCourse({ instructor: instructor._id, status: "draft" });
    await createUser();

    const res = await request(app).get("/api/instructors");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: "Instructors fetched successfully" });
    expect(res.body.data).toHaveLength(1);
    const [item] = res.body.data;
    expect(Object.keys(item).sort()).toEqual([
      "_id",
      "courseCount",
      "headline",
      "name",
      "rating",
      "teachingArea",
    ]);
    expect(item).toMatchObject({
      _id: String(instructor._id),
      name: instructor.name,
      headline: "Web developer and teacher",
      courseCount: 1,
      rating: { average: 5, count: 1 },
    });
    expect(Object.keys(item.teachingArea).sort()).toEqual(["_id", "name", "slug"]);
  });

  it("leaves out instructors with only drafts and deactivated instructors", async () => {
    const draftOnly = await createInstructor();
    await createCourse({ instructor: draftOnly._id, status: "draft" });
    const deactivated = await createInstructor({ isActive: false });
    await publishWithReviews(deactivated);

    const res = await request(app).get("/api/instructors");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("rates instructors from the visible reviews of their published courses only", async () => {
    const instructor = await createInstructor();
    const course = await publishWithReviews(instructor, [5, 3]);
    const student = await createUser();
    await CourseReview.create({
      user: student._id,
      course: course._id,
      courseRating: 1,
      instructorRating: 1,
      comment: "This review was hidden by an admin.",
      isHidden: true,
    });

    const res = await request(app).get("/api/instructors");

    expect(res.body.data[0].rating).toEqual({ average: 4, count: 2 });
  });

  it("puts the most reviewed first, keeps instructors without reviews, and respects the limit", async () => {
    const oneReview = await createInstructor();
    await publishWithReviews(oneReview, [5]);
    const twoReviews = await createInstructor();
    await publishWithReviews(twoReviews, [4, 4]);
    const noReviews = await createInstructor({ headline: "Photographer" });
    await publishWithReviews(noReviews);
    await publishWithReviews(noReviews);

    const all = await request(app).get("/api/instructors");
    expect(all.body.data.map((item) => item._id)).toEqual([
      String(twoReviews._id),
      String(oneReview._id),
      String(noReviews._id),
    ]);
    expect(all.body.data[2]).toMatchObject({ courseCount: 2, rating: { average: 0, count: 0 } });

    const limited = await request(app).get("/api/instructors?limit=2");
    expect(limited.body.data).toHaveLength(2);
  });

  it("returns 4 instructors unless a limit is given", async () => {
    for (let index = 0; index < 5; index += 1) {
      await publishWithReviews(await createInstructor());
    }

    const res = await request(app).get("/api/instructors");

    expect(res.body.data).toHaveLength(4);
  });

  it("refuses a limit that isn't a positive whole number", async () => {
    const res = await request(app).get("/api/instructors?limit=abc");

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "limit", message: "Page and limit must be positive numbers." },
    ]);
  });
});
