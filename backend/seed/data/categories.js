// Owner: Member A
const Category = require("../../src/models/Category");

const names = [
  "Web development",
  "Programming",
  "Business",
  "Design",
  "Marketing",
  "Photography",
  "Personal growth",
];

// Category.create runs the hook that builds each slug ("Web development" -> "web-development").
async function seedCategories() {
  return Category.create(names.map((name) => ({ name })));
}

module.exports = seedCategories;
