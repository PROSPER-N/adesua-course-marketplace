// Reads numbers from Member C's collections (courses, orders, enrollments).
//
// Why read the collections directly? C's Course, Order and Enrollment models aren't merged yet,
// so we can't require them. Mongoose names a model's collection by making it lowercase and
// plural (Course -> "courses"), so we read those collections by name instead.
// - Until C's data exists, the collections are missing and every function returns 0.
// - Once C's models are merged, this keeps working with no changes.
//
// This file must ONLY read. Never insert, update or delete anything from here.

const mongoose = require("mongoose");

// Looked up inside each function, not when this file loads,
// so we share the same collection object that C's model uses once it exists.
function collection(name) {
  return mongoose.connection.collection(name);
}

// Returns { "<categoryId>": <number of published courses> }.
async function publishedCountsByCategory() {
  const rows = await collection("courses")
    .aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();

  const counts = {};
  for (const row of rows) {
    counts[String(row._id)] = row.count;
  }
  return counts;
}

// Counts courses in any status (draft or published) that use this category.
async function countCoursesInCategory(categoryId) {
  // Courses store the category as an ObjectId, so compare with an ObjectId, not a string.
  const category = new mongoose.Types.ObjectId(String(categoryId));
  return collection("courses").countDocuments({ category });
}

module.exports = { publishedCountsByCategory, countCoursesInCategory };
