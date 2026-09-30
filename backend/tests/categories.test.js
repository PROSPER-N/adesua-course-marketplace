const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Category = require("../src/models/Category");
const { createUser, tokenFor } = require("./helpers");

const NAME_MSG = "Category name must be between 2 and 40 characters.";
const LETTER_MSG = "Category name must include a letter or a number.";
const DUPLICATE_MSG = "A category with this name already exists.";

// C's Course model doesn't exist yet, so tests put plain course documents straight into
// the test database's "courses" collection. The app itself only ever reads it.
let courseCount = 0;
function insertCourses(...courses) {
  return mongoose.connection.collection("courses").insertMany(courses);
}
function course(categoryId, status) {
  courseCount += 1;
  return {
    title: `Test course ${courseCount}`,
    category: categoryId,
    status,
    instructor: new mongoose.Types.ObjectId(),
  };
}

async function authHeader(role) {
  const user = await createUser({ role });
  return `Bearer ${tokenFor(user)}`;
}

describe("GET /api/categories", () => {
  it("is public, sorted by name, and counts only published courses", async () => {
    const design = await Category.create({ name: "Design" });
    await Category.create({ name: "Business" });
    await insertCourses(
      course(design._id, "published"),
      course(design._id, "published"),
      course(design._id, "draft")
    );

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(res.body.data).toEqual([
      { _id: expect.any(String), name: "Business", slug: "business", courseCount: 0 },
      { _id: String(design._id), name: "Design", slug: "design", courseCount: 2 },
    ]);
  });
});

describe("POST /api/categories", () => {
  it("lets an admin create a category, with a slug", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", await authHeader("admin"))
      .send({ name: "  Web development " });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Category created successfully");
    expect(res.body.data).toMatchObject({ name: "Web development", slug: "web-development" });
  });

  it("returns 403 for a student", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", await authHeader("student"))
      .send({ name: "Design" });

    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/categories").send({ name: "Design" });

    expect(res.status).toBe(401);
  });

  it("returns 400 with the field error when the name is too short", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", await authHeader("admin"))
      .send({ name: "A" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "name", message: NAME_MSG }]);
  });

  it("returns 400 when the name has no letters or numbers", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", await authHeader("admin"))
      .send({ name: "!!" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([{ field: "name", message: LETTER_MSG }]);
  });

  it("returns 409 when the name already exists, ignoring capital letters", async () => {
    await Category.create({ name: "Design" });

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", await authHeader("admin"))
      .send({ name: "design" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: DUPLICATE_MSG, data: null });
  });
});

describe("PATCH /api/categories/:id", () => {
  it("renames the category and updates its slug", async () => {
    const category = await Category.create({ name: "Photo" });

    const res = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set("Authorization", await authHeader("admin"))
      .send({ name: "Photography" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category updated successfully");
    expect(res.body.data).toMatchObject({ name: "Photography", slug: "photography" });
  });

  it("allows changing only the capital letters of its own name", async () => {
    const category = await Category.create({ name: "design" });

    const res = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set("Authorization", await authHeader("admin"))
      .send({ name: "Design" });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: "Design", slug: "design" });
  });

  it("returns 409 when another category already has the name", async () => {
    await Category.create({ name: "Design" });
    const category = await Category.create({ name: "Business" });

    const res = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set("Authorization", await authHeader("admin"))
      .send({ name: "DESIGN" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(DUPLICATE_MSG);
  });

  it("returns 404 for an unknown ID", async () => {
    const res = await request(app)
      .patch(`/api/categories/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", await authHeader("admin"))
      .send({ name: "Design" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });

  it("returns 400 for an invalid ID", async () => {
    const res = await request(app)
      .patch("/api/categories/abc")
      .set("Authorization", await authHeader("admin"))
      .send({ name: "Design" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid ID");
  });
});

describe("DELETE /api/categories/:id", () => {
  it("deletes a category that no course uses", async () => {
    const category = await Category.create({ name: "Marketing" });

    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set("Authorization", await authHeader("admin"));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
    expect(await Category.exists({ _id: category._id })).toBeNull();
  });

  it("refuses to delete a category used by a draft course", async () => {
    const category = await Category.create({ name: "Business" });
    await insertCourses(course(category._id, "draft"));

    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set("Authorization", await authHeader("admin"));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "This category has courses. Move them to another category first."
    );
    expect(await Category.exists({ _id: category._id })).not.toBeNull();
  });

  it("returns 404 for an unknown ID", async () => {
    const res = await request(app)
      .delete(`/api/categories/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", await authHeader("admin"));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });
});

describe("JSON responses", () => {
  it("don't include Mongoose's __v field", async () => {
    const auth = await authHeader("admin");

    const created = await request(app)
      .post("/api/categories")
      .set("Authorization", auth)
      .send({ name: "Design" });
    const renamed = await request(app)
      .patch(`/api/categories/${created.body.data._id}`)
      .set("Authorization", auth)
      .send({ name: "Graphic design" });

    expect(created.status).toBe(201);
    expect(created.body.data).not.toHaveProperty("__v");
    expect(renamed.status).toBe(200);
    expect(renamed.body.data).not.toHaveProperty("__v");
    expect(renamed.body.data).toMatchObject({ name: "Graphic design", slug: "graphic-design" });
  });
});
