const SiteReview = require("../models/SiteReview");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination, buildPagination } = require("../utils/pagination");
const { summarize, saveReview } = require("../services/review.service");

// GET /api/reviews
const getSiteReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = { isHidden: false };

  const [items, total, summary] = await Promise.all([
    SiteReview.find(filter)
      .select("user rating comment createdAt updatedAt")
      // The role lets the page say whether a learner or an instructor wrote it.
      .populate("user", "name role")
      // _id breaks ties between reviews saved in the same millisecond, so pages never overlap
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SiteReview.countDocuments(filter),
    summarize(SiteReview, filter, "rating"),
  ]);

  sendSuccess(res, {
    message: "Reviews fetched successfully",
    data: { items, pagination: buildPagination(page, limit, total), summary },
  });
});

// GET /api/reviews/mine
const getMySiteReview = asyncHandler(async (req, res) => {
  // Includes isHidden, so the author can see that an admin hid it.
  const review = await SiteReview.findOne({ user: req.user._id });

  sendSuccess(res, { message: "Review fetched successfully", data: review });
});

// PUT /api/reviews/mine
const saveMySiteReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  // Editing never changes isHidden, so a review an admin hid stays hidden.
  const { review, created } = await saveReview(
    SiteReview,
    { user: req.user._id },
    { rating, comment }
  );

  sendSuccess(res, {
    statusCode: created ? 201 : 200,
    message: created ? "Review created successfully" : "Review updated successfully",
    data: review,
  });
});

// DELETE /api/reviews/mine
const deleteMySiteReview = asyncHandler(async (req, res) => {
  const review = await SiteReview.findOneAndDelete({ user: req.user._id });
  if (!review) {
    throw new AppError("Review not found", 404);
  }

  sendSuccess(res, { message: "Review deleted successfully" });
});

module.exports = { getSiteReviews, getMySiteReview, saveMySiteReview, deleteMySiteReview };
