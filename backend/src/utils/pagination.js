const MAX_LIMIT = 50;

// Reads ?page and ?limit and keeps them in a safe range (page at least 1, limit 1 to 50).
function getPagination(query = {}, defaultLimit = 9) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPagination(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { getPagination, buildPagination };
