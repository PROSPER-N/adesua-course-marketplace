// "Web development" -> "web-development"
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // anything that isn't a letter or number becomes a dash
    .replace(/^-+|-+$/g, ""); // no dashes at the start or end
}

module.exports = slugify;
