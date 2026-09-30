const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

// Hide Mongoose's internal "__v" field in every JSON response.
// It's set here because server.js and every test load app.js before any response is sent,
// and Mongoose only reads this setting the first time it turns a document into JSON.
mongoose.set("toJSON", { versionKey: false });

const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// On Render the app sits behind one proxy. Trusting it lets Express see each user's real IP,
// so the login rate limit counts each user separately instead of everyone sharing one limit.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "100kb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

// No app.listen here: server.js starts the server, and tests use the app directly.
module.exports = app;
