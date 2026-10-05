const { body } = require("express-validator");

const lessonCreateRules = [
  body("title", "Lesson title must be between 3 and 120 characters.")
    .isString()
    .trim()
    .isLength({ min: 3, max: 120 }),

  body("videoUrl")
    .optional()
    .isString()
    .trim()
    .custom((value) => {
      if (!value) return true;

      try {
        const url = new URL(value);

        if (
          url.hostname !== "youtube.com" &&
          url.hostname !== "www.youtube.com" &&
          url.hostname !== "youtu.be" &&
          url.hostname !== "www.youtu.be"
        ) {
          throw new Error();
        }

        return true;
      } catch {
        throw new Error("Enter a valid YouTube URL.");
      }
    }),

  body("content").optional().isString().trim(),

  body("durationMinutes", "Duration must be between 1 and 300 minutes.")
    .isInt({ min: 1, max: 300 })
    .toInt(),

  body("order").optional().isInt({ min: 1 }).toInt(),

  body("isPreview").optional().isBoolean().toBoolean(),
];

const lessonUpdateRules = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Lesson title must be between 3 and 120 characters."),

  body("videoUrl")
    .optional()
    .isString()
    .trim()
    .custom((value) => {
      if (!value) return true;

      try {
        const url = new URL(value);

        if (
          url.hostname !== "youtube.com" &&
          url.hostname !== "www.youtube.com" &&
          url.hostname !== "youtu.be" &&
          url.hostname !== "www.youtu.be"
        ) {
          throw new Error();
        }

        return true;
      } catch {
        throw new Error("Enter a valid YouTube URL.");
      }
    }),

  body("content").optional().isString().trim(),

  body("durationMinutes")
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage("Duration must be between 1 and 300 minutes.")
    .toInt(),

  body("order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Lesson order must be at least 1.")
    .toInt(),

  body("isPreview")
    .optional()
    .isBoolean()
    .withMessage("Preview must be true or false.")
    .toBoolean(),
];

module.exports = {
  lessonCreateRules,
  lessonUpdateRules,
};
