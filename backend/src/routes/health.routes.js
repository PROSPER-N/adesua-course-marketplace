// Owner: Member A
// Endpoints:
//   GET /api/health   Public   API is running

const express = require("express");
const { sendSuccess } = require("../utils/apiResponse");

const router = express.Router();

router.get("/", (req, res) => {
  sendSuccess(res, { message: "API is running", data: { time: new Date().toISOString() } });
});

module.exports = router;
