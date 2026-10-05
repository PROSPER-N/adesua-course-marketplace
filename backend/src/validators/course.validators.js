const { body, query } = require("express-validator");

const courseCreateRules = [
  body("title", "Title must be between 5 and 120 characters.")
    .isString()
    .trim()
    .isLength({ min: 5, max: 120 }),

  body("shortDescription", "Keep the short description under 160 characters.")
    .isString()
    .trim()
    .isLength({ max: 160 }),

  body("description", "Description must be at least 20 characters.")
    .isString()
    .trim()
    .isLength({ min: 20 }),

  body("whatYouWillLearn")
    .optional()
    .isArray({ max: 6 })
    .withMessage("List up to 6 things students will learn."),

  body("whatYouWillLearn.*")
    .optional()
    .isString()
    .trim(),

  body("category", "Choose a valid category.").isString().isMongoId(),

  body("price", "Price can't be negative. Enter 0 for a free course.")
    .isNumeric()
    .toFloat()
    .isFloat({ min: 0, max: 5000 }),

  body("level", "Choose a level.")
    .isString()
    .isIn(["beginner", "intermediate", "advanced"]),

  body("thumbnailUrl").optional().isString().trim(),
];

const courseUpdateRules = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 120 })
    .withMessage("Title must be between 5 and 120 characters."),

  body("shortDescription")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Keep the short description under 160 characters."),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters."),

  body("whatYouWillLearn")
    .optional()
    .isArray({ max: 6 })
    .withMessage("List up to 6 things students will learn."),

  body("whatYouWillLearn.*")
    .optional()
    .isString()
    .trim(),

  body("category")
    .optional()
    .isString()
    .isMongoId()
    .withMessage("Choose a valid category."),

  body("price")
    .optional()
    .isNumeric()
    .toFloat()
    .isFloat({ min: 0, max: 5000 })
    .withMessage("Price must be between 0 and 5,000."),

  body("level")
    .optional()
    .isString()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Choose a level."),

  body("thumbnailUrl").optional().isString().trim(),
];

const courseStatusRules = [
  body("status", "Choose a valid course status.")
    .isString()
    .isIn(["draft", "published"]),
];

const courseQueryRules = [
  query("search").optional().isString().trim(),
  query("category").optional().isString().trim(),

  query("level")
    .optional()
    .isString()
    .isIn(["beginner", "intermediate", "advanced"]),

  query("price")
    .optional()
    .isString()
    .isIn(["free", "paid"]),

  query("sort")
    .optional()
    .isString()
    .isIn(["newest", "popular", "price_asc", "price_desc"]),

  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  courseCreateRules,
  courseUpdateRules,
  courseStatusRules,
  courseQueryRules,
};