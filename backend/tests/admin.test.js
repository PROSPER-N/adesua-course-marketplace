const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const { createUser, tokenFor, TEST_PASSWORD } = require("./helpers");

const newId = () => new mongoose.Types.ObjectId();

// C's models don't exist yet, so tests put plain documents straight into the test database.
// Fields that C will probably make unique (the order reference, one enrollment per student and
// course) get different values, so these still insert once C adds indexes.
function insert(collectionName, ...docs) {
  return mongoose.connection.collection(collectionName).insertMany(docs);
}

async function loginAs(role) {
  const user = await createUser({ role });
  return { user, auth: `Bearer ${tokenFor(user)}` };
}

function getUsers(query, auth) {
  return request(app).get(`/api/admin/users${query}`).set("Authorization", auth);
}

function setStatus(userId, body, auth) {
  return request(app)
    .patch(`/api/admin/users/${userId}/status`)
    .set("Authorization", auth)
    .send(body);
}

describe("Admin routes are for admins only", () => {
  // [label for the test name, method, path]
  const routes = [
    ["GET /stats", "get", "/api/admin/stats"],
    ["GET /users", "get", "/api/admin/users"],
    ["PATCH /users/:id/status", "patch", `/api/admin/users/${newId()}/status`],
  ];

  function call(method, path, auth) {
    const req = request(app)[method](path);
    if (auth) req.set("Authorization", auth);
    return method === "patch" ? req.send({ isActive: false }) : req;
  }

  it.each(routes)("%s returns 401 without a token", async (label, method, path) => {
    const res = await call(method, path);

    expect(res.status).toBe(401);
  });

  it.each(routes)("%s returns 403 for a student and an instructor", async (label, method, path) => {
    for (const role of ["student", "instructor"]) {
      const { auth } = await loginAs(role);
      const res = await call(method, path, auth);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You don't have permission to do that");
    }
  });
});

describe("GET /api/admin/stats", () => {
  it("counts users, and returns 0 for the rest when the collections are empty", async () => {
    const { auth } = await loginAs("admin");
    await createUser();
    await createUser({ role: "instructor" });

    const res = await request(app).get("/api/admin/stats").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Stats fetched successfully");
    expect(res.body.data).toEqual({
      users: 3,
      publishedCourses: 0,
      enrollments: 0,
      totalPayments: 0,
    });
  });

  it("counts published courses and enrollments, and adds up paid orders only", async () => {
    const { auth } = await loginAs("admin");
    await insert(
      "courses",
      { title: "Published course", category: newId(), status: "published" },
      { title: "Draft course", category: newId(), status: "draft" }
    );
    await insert(
      "enrollments",
      { student: newId(), course: newId() },
      { student: newId(), course: newId() }
    );
    await insert(
      "orders",
      { reference: "ADS-TEST01", student: newId(), course: newId(), amount: 180, status: "paid" },
      { reference: "ADS-TEST02", student: newId(), course: newId(), amount: 50, status: "pending" }
    );

    const res = await request(app).get("/api/admin/stats").set("Authorization", auth);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      users: 1,
      publishedCourses: 1,
      enrollments: 2,
      totalPayments: 180,
    });
  });
});

describe("GET /api/admin/users", () => {
  it("returns 10 users per page, newest first, with only the listed fields", async () => {
    const { user: admin, auth } = await loginAs("admin");
    await Promise.all(Array.from({ length: 12 }, () => createUser())); // 13 users in total

    const page1 = await getUsers("", auth);
    const page2 = await getUsers("?page=2", auth);

    expect(page1.status).toBe(200);
    expect(page1.body.message).toBe("Users fetched successfully");
    expect(page1.body.data.items).toHaveLength(10);
    expect(page1.body.data.pagination).toEqual({ page: 1, limit: 10, total: 13, totalPages: 2 });
    expect(page2.body.data.items).toHaveLength(3);

    // No user shows up on both pages, and the admin (created first) comes last.
    const ids = [...page1.body.data.items, ...page2.body.data.items].map((user) => user._id);
    expect(new Set(ids).size).toBe(13);
    expect(ids[12]).toBe(String(admin._id));

    expect(Object.keys(page1.body.data.items[0]).sort()).toEqual([
      "_id",
      "createdAt",
      "email",
      "isActive",
      "name",
      "role",
    ]);
  });

  it("searches part of a name or email, ignoring capital letters", async () => {
    const { auth } = await loginAs("admin");
    await User.create({ name: "Kojo Ansah", email: "kojo@example.com", password: TEST_PASSWORD });
    await User.create({ name: "Esi Nyarko", email: "esi@school.edu", password: TEST_PASSWORD });

    const byName = await getUsers("?search=ANSAH", auth);
    const byEmail = await getUsers("?search=school.edu", auth);

    expect(byName.body.data.items.map((user) => user.name)).toEqual(["Kojo Ansah"]);
    expect(byEmail.body.data.items.map((user) => user.name)).toEqual(["Esi Nyarko"]);
  });

  it("treats special characters in the search as plain text", async () => {
    const { auth } = await loginAs("admin");
    await User.create({ name: "Ama (Design)", email: "ama@example.com", password: TEST_PASSWORD });

    const bracket = await getUsers("?search=(", auth); // an unescaped "(" would crash the query
    const anything = await getUsers(`?search=${encodeURIComponent(".*")}`, auth); // would match everyone

    expect(bracket.status).toBe(200);
    expect(bracket.body.data.items.map((user) => user.name)).toEqual(["Ama (Design)"]);
    expect(anything.status).toBe(200);
    expect(anything.body.data.items).toEqual([]);
  });

  it("filters by role", async () => {
    const { auth } = await loginAs("admin");
    await createUser({ role: "instructor" });
    await createUser();

    const res = await getUsers("?role=instructor", auth);

    expect(res.status).toBe(200);
    expect(res.body.data.items.map((user) => user.role)).toEqual(["instructor"]);
  });

  it("returns 400 for a role that doesn't exist", async () => {
    const { auth } = await loginAs("admin");

    const res = await getUsers("?role=teacher", auth);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "role", message: "Choose a valid role." }]);
  });

  it("returns 400 when page isn't a positive number", async () => {
    const { auth } = await loginAs("admin");

    const res = await getUsers("?page=abc", auth);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "page", message: "Page and limit must be positive numbers." },
    ]);
  });
});

describe("PATCH /api/admin/users/:id/status", () => {
  it("deactivates a student, who then can't log in or use their old token", async () => {
    const { auth } = await loginAs("admin");
    const student = await createUser();
    const oldToken = tokenFor(student);

    const res = await setStatus(student._id, { isActive: false }, auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deactivated");
    expect(res.body.data).toMatchObject({ _id: String(student._id), isActive: false });
    expect(res.body.data).not.toHaveProperty("password");
    expect(res.body.data).not.toHaveProperty("__v");

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: student.email, password: TEST_PASSWORD });
    expect(login.status).toBe(403);

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${oldToken}`);
    expect(me.status).toBe(403);
  });

  it("reactivates a user, who can then log in again", async () => {
    const { auth } = await loginAs("admin");
    const student = await createUser({ isActive: false });

    const res = await setStatus(student._id, { isActive: true }, auth);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User reactivated");
    expect(res.body.data.isActive).toBe(true);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: student.email, password: TEST_PASSWORD });
    expect(login.status).toBe(200);
  });

  it("won't let an admin deactivate their own account", async () => {
    const { user: admin, auth } = await loginAs("admin");

    const res = await setStatus(admin._id, { isActive: false }, auth);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("You can't deactivate your own account.");
  });

  it('returns 400 when isActive is "yes" instead of true or false', async () => {
    const { auth } = await loginAs("admin");
    const student = await createUser();

    const res = await setStatus(student._id, { isActive: "yes" }, auth);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      { field: "isActive", message: "isActive must be true or false." },
    ]);
  });

  it("returns 404 for an unknown user", async () => {
    const { auth } = await loginAs("admin");

    const res = await setStatus(newId(), { isActive: false }, auth);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
