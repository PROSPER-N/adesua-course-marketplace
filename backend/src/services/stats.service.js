// Reads numbers from the courses, orders and enrollments collections.
//
// It reads the collections by name instead of requiring the models, because it was written before
// the Course model existed. Mongoose names a model's collection by making it lowercase and plural,
// so the Course model's collection is "courses". Until a collection has data, its numbers are 0.
//
// This file must only read. Never insert, update or delete anything from here.

const mongoose = require("mongoose");

// Looked up inside each function, not when this file loads,
// so we share the same collection object the models use.
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

// Totals for the admin dashboard: published courses, enrollments, and money from paid orders.
async function getPlatformTotals() {
  const [publishedCourses, enrollments, paidRows] = await Promise.all([
    collection("courses").countDocuments({ status: "published" }),
    collection("enrollments").countDocuments(),
    collection("orders")
      .aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
  ]);

  // With no paid orders the aggregation returns no rows, so the total is 0.
  const totalPayments = paidRows.length > 0 ? paidRows[0].total : 0;

  return { publishedCourses, enrollments, totalPayments };
}

module.exports = { publishedCountsByCategory, countCoursesInCategory, getPlatformTotals };
