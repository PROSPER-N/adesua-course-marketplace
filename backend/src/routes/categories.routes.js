// Owner: Member A
// Mounted at /api/categories. Endpoints (see docs/API_CONTRACT.md):
//   GET    /api/categories       Public   Categories with published-course counts
//   POST   /api/categories       Admin    Create a category
//   PATCH  /api/categories/:id   Admin    Rename a category
//   DELETE /api/categories/:id   Admin    Delete an unused category
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.

const express = require("express");
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { categoryRules } = require("../validators/category.validators");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const router = express.Router();

router.get("/", listCategories);
router.post("/", protect, authorize("admin"), categoryRules, validate, createCategory);
router.patch(
  "/:id",
  validateObjectId(),
  protect,
  authorize("admin"),
  categoryRules,
  validate,
  updateCategory
);
// DELETE has no body, so validateObjectId is its only check.
router.delete("/:id", validateObjectId(), protect, authorize("admin"), deleteCategory);

module.exports = router;
