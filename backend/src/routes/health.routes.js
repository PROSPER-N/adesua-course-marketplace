// Owner: Member A
// Mounted at /api/health. Endpoints (see docs/API_CONTRACT.md):
//   GET /api/health   Public   API is running

const express = require("express");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();

router.get("/", (req, res) => {
  sendSuccess(res, { message: "API is running", data: { time: new Date().toISOString() } });
});

module.exports = router;
