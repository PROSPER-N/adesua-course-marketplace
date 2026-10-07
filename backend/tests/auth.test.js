const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const { createUser, tokenFor, TEST_PASSWORD } = require("./helpers");

const HEADLINE_MSG = "Add a short headline, like Web developer and teacher.";
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
