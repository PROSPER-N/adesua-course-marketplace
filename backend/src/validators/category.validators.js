const { body } = require("express-validator");

const NAME_MSG = "Category name must be between 2 and 40 characters.";
const LETTER_MSG = "Category name must include a letter or a number.";

// Used by POST /api/categories and PATCH /api/categories/:id.
const categoryRules = [
  body("name", NAME_MSG)
    .isString()
    .trim()
    .isLength({ min: 2, max: 40 })
    // A name like "!!" would get an empty slug, so it couldn't be used as a course filter.
    .matches(/[A-Za-z0-9]/)
    .withMessage(LETTER_MSG),
];

module.exports = { categoryRules };
