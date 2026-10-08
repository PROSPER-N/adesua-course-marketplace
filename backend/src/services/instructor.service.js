const Course = require("../models/Course");
const User = require("../models/User");
const { getInstructorRating } = require("./review.service");

// Active instructors with at least one published course, for the public list on Home.
// The most reviewed come first, then the best rated, then those with the most courses.
async function getPublicInstructors(limit) {
  const courseCounts = await Course.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$instructor", courseCount: { $sum: 1 } } },
  ]);
  const courseCountById = new Map(
    courseCounts.map(({ _id, courseCount }) => [String(_id), courseCount])
  );

  const instructors = await User.find({
    _id: { $in: [...courseCountById.keys()] },
    role: "instructor",
    isActive: true,
  })
    .select("_id name headline teachingArea")
    .populate("teachingArea", "_id name slug")
    .lean();

  // Ratings are worked out per instructor, like on the course page. The list is short.
  const items = await Promise.all(
    instructors.map(async (instructor) => ({
      _id: instructor._id,
      name: instructor.name,
      // Accounts made before these fields existed may not have them.
      headline: instructor.headline ?? "",
      teachingArea: instructor.teachingArea ?? null,
      rating: await getInstructorRating(instructor._id),
      courseCount: courseCountById.get(String(instructor._id)),
    }))
  );

  return items
    .sort(
      (a, b) =>
        b.rating.count - a.rating.count ||
        b.rating.average - a.rating.average ||
        b.courseCount - a.courseCount ||
        a.name.localeCompare(b.name)
    )
    .slice(0, limit);
}

module.exports = { getPublicInstructors };
