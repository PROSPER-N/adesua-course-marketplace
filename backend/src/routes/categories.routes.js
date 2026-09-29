// Owner: Member A
// Mounted at /api/categories. Endpoints (see docs/API_CONTRACT.md):
//   GET    /api/categories       Public   Categories with published-course counts
//   POST   /api/categories       Admin    Create a category
//   PATCH  /api/categories/:id   Admin    Rename a category
//   DELETE /api/categories/:id   Admin    Delete an unused category
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.

const express = require("express");

const router = express.Router();

// TODO (Member A): add the category routes.

module.exports = router;
