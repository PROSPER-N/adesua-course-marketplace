const { body } = require("express-validator");
const Category = require("../models/Category");

const NAME_MSG = "Name must be between 2 and 50 characters.";
const EMAIL_MSG = "Enter a valid email address.";
const PASSWORD_MSG = "Password must be at least 8 characters and include a letter and a number.";
const ROLE_MSG = "Choose to learn or to teach.";
const HEADLINE_MSG = "Add a short headline, like Web developer and teacher.";
const TEACHING_AREA_MSG = "Choose your main teaching area.";
const INTERESTS_MSG = "Choose up to 5 interests.";

// body(field, message) gives every check in that chain the same message.
// isString() comes first so arrays and objects (like { "$gt": "" }) are rejected.

// Each role has its own profile fields. The other role's fields are never checked,
// and the controller doesn't save them. No role means a student account.
const isInstructor = (value, { req }) => req.body?.role === "instructor";
const isStudent = (value, { req }) => req.body?.role !== "instructor";

const registerRules = [
  body("name", NAME_MSG).isString().trim().isLength({ min: 2, max: 50 }),
  body("email", EMAIL_MSG).isString().trim().toLowerCase().isEmail(),
  body("password", PASSWORD_MSG)
    .isString()
    .isLength({ min: 8 })
    .matches(/[A-Za-z]/) // at least one letter
    .matches(/\d/), // at least one number
  // "admin" is not in the list, so sign-up can never create an admin.
  body("role", ROLE_MSG).optional().isIn(["student", "instructor"]),
  body("headline", HEADLINE_MSG).if(isInstructor).isString().trim().isLength({ min: 5, max: 80 }),
  body("teachingArea", TEACHING_AREA_MSG)
    .if(isInstructor)
    .isString()
    .isMongoId()
    .bail()
    .custom(async (id) => {
      if (!(await Category.exists({ _id: id }))) throw new Error(TEACHING_AREA_MSG);
    }),
  body("interests", INTERESTS_MSG)
    .if(isStudent)
    .optional()
    .isArray({ max: 5 })
    .bail()
    .isMongoId() // checks each ID in the list
    .bail()
    .custom(async (ids) => {
      // A repeated ID matches fewer categories than the list has, so duplicates fail here too.
      const found = await Category.countDocuments({ _id: { $in: ids } });
      if (found !== ids.length) throw new Error(INTERESTS_MSG);
    }),
];

const loginRules = [
  body("email", EMAIL_MSG).isString().trim().toLowerCase().isEmail(),
  body("password", "Enter your password.").isString().notEmpty(),
];

module.exports = { registerRules, loginRules };
