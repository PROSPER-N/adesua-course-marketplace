// Ratings shared by course reviews, platform reviews, admin moderation, course data and the seed.

const mongoose = require("mongoose");
const Course = require("../models/Course");
const CourseReview = require("../models/CourseReview");

// One decimal place, like 4.3.
function roundRating(value) {
  return Math.round(value * 10) / 10;
}

// Recounts a course's rating from its visible reviews and stores it on the course,
// so course lists can show it without reading every review.
async function recalculateCourseRating(courseId) {
  // aggregate() doesn't cast like find() does, so the ID must be an ObjectId here.
  const [result] = await CourseReview.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(String(courseId)), isHidden: false } },
    { $group: { _id: null, average: { $avg: "$courseRating" }, count: { $sum: 1 } } },
  ]);

  const ratingAverage = result ? roundRating(result.average) : 0;
  const ratingCount = result ? result.count : 0;
  await Course.updateOne({ _id: courseId }, { ratingAverage, ratingCount });
  return { ratingAverage, ratingCount };
}

module.exports = { roundRating, recalculateCourseRating };
