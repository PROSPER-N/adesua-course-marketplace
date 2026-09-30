const Category = require("../models/Category");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const slugify = require("../utils/slugify");
const { sendSuccess } = require("../utils/apiResponse");
const { publishedCountsByCategory, countCoursesInCategory } = require("../services/stats.service");

const DUPLICATE_NAME = "A category with this name already exists.";

// Two names clash when they give the same slug, like "Design" and "design".
// We check before saving, so the admin gets a clear message instead of "slug already exists".
async function nameIsTaken(name, exceptId) {
  const filter = { slug: slugify(name) };
  if (exceptId) filter._id = { $ne: exceptId };
  return Category.exists(filter);
}

// GET /api/categories
const listCategories = asyncHandler(async (req, res) => {
  const [categories, counts] = await Promise.all([
    // collation({ locale: "en" }) makes the sort ignore capital letters
    Category.find().select("name slug").sort({ name: 1 }).collation({ locale: "en" }).lean(),
    publishedCountsByCategory(),
  ]);

  const items = categories.map((category) => ({
    ...category,
    courseCount: counts[String(category._id)] || 0,
  }));

  sendSuccess(res, { message: "Categories fetched successfully", data: items });
});

// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (await nameIsTaken(name)) {
    throw new AppError(DUPLICATE_NAME, 409);
  }

  const category = await Category.create({ name });

  sendSuccess(res, { statusCode: 201, message: "Category created successfully", data: category });
});

// PATCH /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const { name } = req.body;
  if (await nameIsTaken(name, category._id)) {
    throw new AppError(DUPLICATE_NAME, 409);
  }

  // Load, change, then save: save() runs the model's hook that updates the slug.
  // findByIdAndUpdate() would skip that hook.
  category.name = name;
  await category.save();

  sendSuccess(res, { message: "Category updated successfully", data: category });
});

// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const courseCount = await countCoursesInCategory(category._id);
  if (courseCount > 0) {
    throw new AppError("This category has courses. Move them to another category first.", 400);
  }

  await category.deleteOne();

  sendSuccess(res, { message: "Category deleted successfully" });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
