const mongoose = require("mongoose");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Category = require("../models/Category");
const Enrollment = require("../models/Enrollment");
const AppError = require("../utils/AppError");
const escapeRegex = require("../utils/escapeRegex");
const { getPagination, buildPagination } = require("../utils/pagination");

const ALLOWED_UPDATE_FIELDS = [
  "title",
  "shortDescription",
  "description",
  "whatYouWillLearn",
  "category",
  "price",
  "level",
  "thumbnailUrl",
];

const SORTS = {
  newest: { createdAt: -1 },
  popular: { studentCount: -1, createdAt: -1 },
  price_asc: { price: 1, createdAt: -1 },
  price_desc: { price: -1, createdAt: -1 },
};

function pickAllowedFields(data = {}) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_UPDATE_FIELDS.includes(key)),
  );
}

async function findCategoryBySlug(slug) {
  if (!slug) return null;

  return Category.findOne({ slug }).select("_id name slug");
}

async function getPublishedCourses(query) {
  const {
    search,
    category,
    level,
    price,
    sort = "newest",
  } = query;

  const { page, limit, skip } = getPagination(query);

  const filter = { status: "published" };

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  if (category) {
    const categoryDoc = await findCategoryBySlug(category);

    if (!categoryDoc) {
      return {
        items: [],
        pagination: buildPagination(page, limit, 0),
      };
    }

    filter.category = categoryDoc._id;
  }

  if (level) {
    filter.level = level;
  }

  if (price === "free") {
    filter.price = 0;
  }

  if (price === "paid") {
    filter.price = { $gt: 0 };
  }

 const [courses, total] = await Promise.all([
  Course.find(filter)
    .select(
      "_id title shortDescription price level thumbnailUrl lessonCount totalMinutes studentCount createdAt category instructor",
    )
    .populate("category", "_id name slug")
    .populate("instructor", "_id name")
    .sort(SORTS[sort] || SORTS.newest)
    .skip(skip)
    .limit(limit)
    .lean(),

    Course.countDocuments(filter),
  ]);

  return {
    items: courses,
    pagination: buildPagination(page, limit, total),
  };
}

async function getPublishedCourseById(courseId) {
  const course = await Course.findOne({
    _id: courseId,
    status: "published",
  })
    .populate("category", "_id name slug")
    .populate("instructor", "_id name bio")
    .lean();

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const lessons = await Lesson.find({ course: course._id })
    .sort({ order: 1 })
    .lean();

  const safeLessons = lessons.map((lesson) => {
    if (lesson.isPreview) return lesson;

    const { videoUrl, content, ...safeLesson } = lesson;
    return safeLesson;
  });

  return {
    ...course,
    lessons: safeLessons,
  };
}

async function createCourse(data, instructorId) {
  const category = await Category.findById(data.category);

  if (!category) {
    throw new AppError("Choose a valid category.", 400);
  }

  return Course.create({
    ...data,
    instructor: instructorId,
    status: "draft",
    lessonCount: 0,
    totalMinutes: 0,
    studentCount: 0,
  });
}

async function getCourseForOwner(courseId, user) {
  const course = await Course.findById(courseId)
    .populate("category", "_id name slug")
    .populate("instructor", "_id name bio");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwner =
    course.instructor &&
    course.instructor._id.toString() === user._id.toString();

  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You don't have permission to do that", 403);
  }

  return course;
}

async function updateCourse(courseId, data, user) {
  const course = await getCourseForOwner(courseId, user);

  const updates = pickAllowedFields(data);

  if (updates.category) {
    const category = await Category.findById(updates.category);

    if (!category) {
      throw new AppError("Choose a valid category.", 400);
    }
  }

  Object.assign(course, updates);
  await course.save();

  return course;
}

async function updateCourseStatus(courseId, status, user) {
  const course = await getCourseForOwner(courseId, user);

  if (status === "published" && course.lessonCount === 0) {
    throw new AppError("Add at least one lesson before publishing.", 400);
  }

  course.status = status;
  await course.save();

  return course;
}

async function deleteCourse(courseId, user) {
  const course = await getCourseForOwner(courseId, user);

  if (course.studentCount > 0) {
    throw new AppError(
      "This course has students. Unpublish it instead.",
      400,
    );
  }

  await Lesson.deleteMany({ course: course._id });
  await Course.deleteOne({ _id: course._id });
}

async function createLesson(courseId, data, user) {
  const course = await getCourseForOwner(courseId, user);

  const hasVideo = Boolean(data.videoUrl);
  const hasContent = Boolean(data.content);

  if (!hasVideo && !hasContent) {
    throw new AppError("Add a video or lesson notes.", 400);
  }

  let order = data.order;

  if (!order) {
    const lastLesson = await Lesson.findOne({ course: course._id })
      .sort({ order: -1 })
      .select("order")
      .lean();

    order = lastLesson ? lastLesson.order + 1 : 1;
  }

  const lesson = await Lesson.create({
    ...data,
    course: course._id,
    order,
  });

  await Course.updateOne(
    { _id: course._id },
    {
      $inc: {
        lessonCount: 1,
        totalMinutes: lesson.durationMinutes,
      },
    },
  );

  return lesson;
}

async function updateLesson(lessonId, data, user) {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You don't have permission to do that", 403);
  }

  const oldDuration = lesson.durationMinutes;

  const allowedFields = [
    "title",
    "videoUrl",
    "content",
    "durationMinutes",
    "order",
    "isPreview",
  ];

  Object.assign(
    lesson,
    Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key)),
    ),
  );

  if (!lesson.videoUrl && !lesson.content) {
    throw new AppError("Add a video or lesson notes.", 400);
  }

  await lesson.save();

  const durationDifference =
    lesson.durationMinutes - oldDuration;

  if (durationDifference !== 0) {
    await Course.updateOne(
      { _id: course._id },
      { $inc: { totalMinutes: durationDifference } },
    );
  }

  return lesson;
}

async function deleteLesson(lessonId, user) {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You don't have permission to do that", 403);
  }

  if (course.status === "published" && course.lessonCount <= 1) {
    throw new AppError(
      "A published course needs at least one lesson. Unpublish it first.",
      400,
    );
  }

  await Lesson.deleteOne({ _id: lesson._id });

  await Course.updateOne(
    { _id: course._id },
    {
      $inc: {
        lessonCount: -1,
        totalMinutes: -lesson.durationMinutes,
      },
    },
  );

  await Enrollment.updateMany(
    { course: course._id },
    { $pull: { completedLessons: lesson._id } },
  );
}

async function getInstructorCourses(userId) {
  return Course.find({ instructor: userId })
    .populate("category", "_id name slug")
    .sort({ createdAt: -1 })
    .lean();
}

async function getInstructorCourse(courseId, user) {
  const course = await getCourseForOwner(courseId, user);

  const lessons = await Lesson.find({ course: course._id })
    .sort({ order: 1 })
    .lean();

  return {
    ...course.toObject(),
    lessons,
  };
}

module.exports = {
  getPublishedCourses,
  getPublishedCourseById,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  getInstructorCourses,
  getInstructorCourse,
};
