const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Category = require("../src/models/Category");
const User = require("../src/models/User");
const { createUser, tokenFor, TEST_PASSWORD } = require("./helpers");

const HEADLINE_MSG = "Add a short headline, like Web developer and teacher.";
const TEACHING_AREA_MSG = "Choose your main teaching area.";
const INTERESTS_MSG = "Choose up to 5 interests.";

const newStudent = { name: "Akosua Mensah", email: "akosua@example.com", password: "Demo1234" };

describe("POST /api/auth/register", () => {
  it("creates an account and never returns the password", async () => {
    const res = await request(app).post("/api/auth/register").send(newStudent);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Account created successfully");
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ email: "akosua@example.com", role: "student" });
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 409 when the email is already registered", async () => {
    await request(app).post("/api/auth/register").send(newStudent);
    const res = await request(app).post("/api/auth/register").send(newStudent);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "An account with this email already exists",
      data: null,
    });
  });

  it("never creates an admin", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newStudent, role: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "role", message: "Choose to learn or to teach." }]);
  });
});

describe("Sign-up profile fields", () => {
  let categories;

  beforeEach(async () => {
    const names = ["Web development", "Programming", "Business", "Design", "Marketing", "Photo"];
    categories = await Category.create(names.map((name) => ({ name })));
  });

  // The IDs of the first few test categories, as the client sends them.
  const ids = (count) => categories.slice(0, count).map((category) => category._id.toString());
  const unknownId = () => new mongoose.Types.ObjectId().toString();

  const newInstructor = () => ({
    name: "Kofi Boateng",
    email: "kofi@example.com",
    password: TEST_PASSWORD,
    role: "instructor",
    headline: "  Web developer and teacher  ",
    teachingArea: ids(1)[0],
  });

  async function loginAndGetMe(email) {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: TEST_PASSWORD });
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.data.token}`);
    return [login.body.data.user, me.body.data.user];
  }

  it("creates an instructor with a trimmed headline and a teaching area", async () => {
    const res = await request(app).post("/api/auth/register").send(newInstructor());

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({
      role: "instructor",
      headline: "Web developer and teacher",
      teachingArea: ids(1)[0],
    });
    expect(res.body.data.user.interests).toBeUndefined();
  });

  it("asks an instructor for a headline and a teaching area", async () => {
    const { headline, teachingArea, ...body } = newInstructor();
    const res = await request(app).post("/api/auth/register").send(body);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "headline", message: HEADLINE_MSG },
      { field: "teachingArea", message: TEACHING_AREA_MSG },
    ]);
  });

  it.each([
    ["4 characters", "Web."],
    ["81 characters", "a".repeat(81)],
    ["only spaces", "      "],
  ])("rejects a headline with %s", async (_, headline) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newInstructor(), headline });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "headline", message: HEADLINE_MSG }]);
  });

  it.each([
    ["isn't an ID", () => "design"],
    ["is an unknown ID", unknownId],
  ])("rejects a teaching area that %s", async (_, teachingArea) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newInstructor(), teachingArea: teachingArea() });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "teachingArea", message: TEACHING_AREA_MSG }]);
  });

  it("saves a learner's interests, and no role means a learner", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newStudent, interests: ids(2) });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ role: "student", interests: ids(2) });
    expect(res.body.data.user.headline).toBeUndefined();
    expect(res.body.data.user.teachingArea).toBeUndefined();
  });

  it("gives a learner who picks no interests an empty list", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newStudent, role: "student" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.interests).toEqual([]);
  });

  it.each([
    ["6 interests", () => ids(6)],
    ["something that isn't a list", () => "design"],
    ["an ID that isn't valid", () => [...ids(1), "design"]],
    ["an unknown ID", () => [...ids(1), unknownId()]],
    ["the same ID twice", () => [...ids(1), ...ids(1)]],
  ])("rejects %s as interests", async (_, interests) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newStudent, interests: interests() });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "interests", message: INTERESTS_MSG }]);
  });

  it("ignores instructor fields sent for a learner", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newStudent, headline: "x", teachingArea: "not-an-id" });

    expect(res.status).toBe(201);
    const saved = await User.findById(res.body.data.user._id).lean();
    expect(saved.headline).toBeUndefined();
    expect(saved.teachingArea).toBeUndefined();
  });

  it("ignores interests sent for an instructor", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newInstructor(), interests: ["abc", ...ids(6)] });

    expect(res.status).toBe(201);
    const saved = await User.findById(res.body.data.user._id).lean();
    expect(saved.interests).toBeUndefined();
  });

  it("returns an instructor's headline and teaching area from login and /me", async () => {
    await request(app).post("/api/auth/register").send(newInstructor());

    const fields = { headline: "Web developer and teacher", teachingArea: ids(1)[0] };
    const [loggedIn, me] = await loginAndGetMe("kofi@example.com");
    expect(loggedIn).toMatchObject(fields);
    expect(me).toMatchObject(fields);
  });

  it("returns a learner's interests from login and /me", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ ...newStudent, interests: ids(2) });

    const [loggedIn, me] = await loginAndGetMe(newStudent.email);
    expect(loggedIn.interests).toEqual(ids(2));
    expect(me.interests).toEqual(ids(2));
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with the right password", async () => {
    const user = await createUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("returns 401 for a wrong password", async () => {
    const user = await createUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Wrong1234" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });

  it("returns 403 for a deactivated account", async () => {
    const user = await createUser({ isActive: false });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("This account has been deactivated");
  });

  it("is not rate-limited during tests", async () => {
    // 25 is more than the limit of 20, so this fails if the limiter isn't skipped in tests.
    for (let i = 0; i < 25; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "Wrong1234" });
      expect(res.status).toBe(401);
    }
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Please log in to continue", data: null });
  });

  it("returns the current user with a valid token", async () => {
    const user = await createUser({ role: "instructor" });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ email: user.email, role: "instructor" });
  });
});

describe("User model profile fields", () => {
  const userData = { name: "Model Test", email: "model@test.com", password: TEST_PASSWORD };

  it("rejects a headline over 80 characters", async () => {
    await expect(
      User.create({ ...userData, role: "instructor", headline: "a".repeat(81) })
    ).rejects.toMatchObject({
      name: "ValidationError",
      errors: { headline: expect.objectContaining({ message: HEADLINE_MSG }) },
    });
  });

  it("rejects more than 5 interests", async () => {
    const interests = Array.from({ length: 6 }, () => new mongoose.Types.ObjectId());

    await expect(User.create({ ...userData, interests })).rejects.toMatchObject({
      name: "ValidationError",
      errors: { interests: expect.objectContaining({ message: INTERESTS_MSG }) },
    });
  });

  it("gives instructors and admins no interests list", async () => {
    const instructor = await createUser({ role: "instructor" });
    const admin = await createUser({ role: "admin" });

    expect(instructor.toJSON().interests).toBeUndefined();
    expect(admin.toJSON().interests).toBeUndefined();
  });
});
