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

// The summary under a list of reviews: the average, the count and how many reviews gave
// each number of stars. field is "courseRating" for course reviews and "rating" for platform ones.
async function summarize(Model, filter, field) {
  const groups = await Model.aggregate([
    { $match: filter },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let count = 0;
  let stars = 0;
  for (const group of groups) {
    breakdown[group._id] = group.count;
    count += group.count;
    stars += group._id * group.count;
  }

  return { average: count ? roundRating(stars / count) : 0, count, breakdown };
}

// Creates the user's review, or updates it when they already have one.
// owner is the filter that finds it, like { user, course }. Returns the review and whether it's new.
async function saveReview(Model, owner, fields) {
  let review = await Model.findOne(owner);
  const created = !review;
  if (created) review = new Model(owner);
  review.set(fields);

  try {
    await review.save();
  } catch (error) {
    // Two quick saves can both find no review. The unique index stops the second one,
    // which then updates the review the first one made.
    if (error.code !== 11000 || !created) throw error;
    review = await Model.findOne(owner);
    review.set(fields);
    await review.save();
    return { review, created: false };
  }

  return { review, created };
}

module.exports = { roundRating, recalculateCourseRating, summarize, saveReview };
