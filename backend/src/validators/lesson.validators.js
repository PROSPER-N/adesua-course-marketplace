const { body } = require("express-validator");

// The contract's words (docs/API_CONTRACT.md, "Validation messages").
const TITLE_MSG = "Lesson title must be between 3 and 120 characters.";
const VIDEO_MSG = "Use a YouTube link.";
const DURATION_MSG = "Enter the length in minutes (1 to 300).";
// Not in the contract: the same words as the Lesson model.
const ORDER_MSG = "Lesson order must be a whole number of 1 or more.";

// YouTube video IDs are 11 letters, numbers, dashes or underscores.
const VIDEO_ID = /^[\w-]{11}$/;

// Accepts the same links the lesson player can play (frontend/src/utils/youtubeEmbedUrl.js):
// youtu.be/<id>, youtube.com/watch?v=<id> and youtube.com/embed/<id>, with or without www. or m.
function isYoutubeLink(link) {
  let url;
  try {
    url = new URL(link);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const host = url.hostname.replace(/^(www|m)\./, "");
  let id = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (host === "youtube.com" && url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else if (host === "youtube.com" && url.pathname.startsWith("/embed/")) {
    id = url.pathname.slice("/embed/".length);
  }

  return Boolean(id) && VIDEO_ID.test(id);
}

// An empty string means no video, for a lesson that has only notes.
function videoRule() {
  return body("videoUrl", VIDEO_MSG)
    .optional()
    .isString()
    .trim()
    .custom((value) => value === "" || isYoutubeLink(value));
}

const lessonCreateRules = [
  body("title", TITLE_MSG).isString().trim().isLength({ min: 3, max: 120 }),
  videoRule(),
  body("content").optional().isString().trim(),
  body("durationMinutes", DURATION_MSG).isInt({ min: 1, max: 300 }).toInt(),
  body("order", ORDER_MSG).optional().isInt({ min: 1 }).toInt(),
  body("isPreview").optional().isBoolean().toBoolean(),
];

// Same checks as creating, but every field is optional.
const lessonUpdateRules = [
  body("title", TITLE_MSG).optional().isString().trim().isLength({ min: 3, max: 120 }),
  videoRule(),
  body("content").optional().isString().trim(),
  body("durationMinutes", DURATION_MSG).optional().isInt({ min: 1, max: 300 }).toInt(),
  body("order", ORDER_MSG).optional().isInt({ min: 1 }).toInt(),
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
