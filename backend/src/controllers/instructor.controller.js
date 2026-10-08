const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");
const { getPublicInstructors } = require("../services/instructor.service");

// GET /api/instructors
const getInstructors = asyncHandler(async (req, res) => {
  // Only the limit is used. The list is short, so it has no pages.
  const { limit } = getPagination(req.query, 4);
  const instructors = await getPublicInstructors(limit);

  sendSuccess(res, { message: "Instructors fetched successfully", data: instructors });
});

module.exports = { getInstructors };
