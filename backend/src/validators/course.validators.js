const { body, query } = require("express-validator");
const { pageAndLimitRule } = require("./admin.validators");

// The contract's words (docs/API_CONTRACT.md, "Validation messages").
const TITLE_MSG = "Title must be between 5 and 120 characters.";
const SHORT_DESCRIPTION_MSG = "Keep the short description under 160 characters.";
const DESCRIPTION_MSG = "Description must be at least 20 characters.";
const LEARN_MSG = "List up to 6 things students will learn.";
const CATEGORY_MSG = "Choose a valid category.";
const PRICE_MIN_MSG = "Price can't be negative. Enter 0 for a free course.";
const PRICE_MAX_MSG = "Price can't be more than 5,000.";
const LEVEL_MSG = "Choose a level.";
const THUMBNAIL_MSG = "Enter a full link starting with https://.";
const STATUS_MSG = "Status must be draft or published.";

const LEVELS = ["beginner", "intermediate", "advanced"];

// Below 0 and above 5,000 have different messages, so the second check runs only after the first passes.
function priceRule() {
  return body("price", PRICE_MIN_MSG)
    .isFloat({ min: 0 })
    .bail()
    .isFloat({ max: 5000 })
    .withMessage(PRICE_MAX_MSG)
    .toFloat();
}

// An empty string means no thumbnail, so the course shows its category cover instead.
function thumbnailRule() {
  return body("thumbnailUrl", THUMBNAIL_MSG)
    .optional()
    .isString()
    .trim()
    .if((value) => value !== "")
    .isURL({ protocols: ["https"], require_protocol: true });
}

const courseCreateRules = [
  body("title", TITLE_MSG).isString().trim().isLength({ min: 5, max: 120 }),
  body("shortDescription", SHORT_DESCRIPTION_MSG).isString().trim().isLength({ max: 160 }),
  body("description", DESCRIPTION_MSG).isString().trim().isLength({ min: 20 }),
  body("whatYouWillLearn", LEARN_MSG).optional().isArray({ max: 6 }),
  body("whatYouWillLearn.*").optional().isString().trim(),
  body("category", CATEGORY_MSG).isString().isMongoId(),
  priceRule(),
  body("level", LEVEL_MSG).isString().isIn(LEVELS),
  thumbnailRule(),
];

// Same checks as creating, but every field is optional.
const courseUpdateRules = [
  body("title", TITLE_MSG).optional().isString().trim().isLength({ min: 5, max: 120 }),
  body("shortDescription", SHORT_DESCRIPTION_MSG)
    .optional()
    .isString()
    .trim()
    .isLength({ max: 160 }),
  body("description", DESCRIPTION_MSG).optional().isString().trim().isLength({ min: 20 }),
  body("whatYouWillLearn", LEARN_MSG).optional().isArray({ max: 6 }),
  body("whatYouWillLearn.*").optional().isString().trim(),
  body("category", CATEGORY_MSG).optional().isString().isMongoId(),
  priceRule().optional(),
  body("level", LEVEL_MSG).optional().isString().isIn(LEVELS),
  thumbnailRule(),
];

const courseStatusRules = [body("status", STATUS_MSG).isString().isIn(["draft", "published"])];

const courseQueryRules = [
  query("search").optional().isString().trim(),
  query("category").optional().isString().trim(),

  query("level").optional().isString().isIn(LEVELS),

  query("price").optional().isString().isIn(["free", "paid"]),

  query("sort").optional().isString().isIn(["newest", "popular", "price_asc", "price_desc"]),

  pageAndLimitRule(),
];

module.exports = {
  courseCreateRules,
  courseUpdateRules,
  courseStatusRules,
  courseQueryRules,
};
