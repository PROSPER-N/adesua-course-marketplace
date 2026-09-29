// Owner: Member A
// Mounted at /api/admin. Endpoints (see docs/API_CONTRACT.md):
//   GET   /api/admin/stats              Admin   Platform totals
//   GET   /api/admin/users              Admin   Users with search, role filter, pagination
//   PATCH /api/admin/users/:id/status   Admin   Deactivate or reactivate { isActive }
//   GET   /api/admin/courses            Admin   All courses including drafts
// Route pattern: see "Backend pattern" in docs/CONVENTIONS.md.

const express = require("express");

const router = express.Router();

// TODO (Member A): add the admin routes.

module.exports = router;
