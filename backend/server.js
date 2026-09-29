require("dotenv").config({ quiet: true });

const app = require("./src/app");
const connectDB = require("./src/config/db");

// Stop straight away with a clear message instead of failing later in a confusing way.
const requiredVars = ["MONGO_URI", "JWT_SECRET"];
const missingVars = requiredVars.filter((name) => !process.env[name]);
if (missingVars.length > 0) {
  console.error(`Missing ${missingVars.join(" and ")} in backend/.env.`);
  console.error("Copy .env.example to .env and fill in the blank lines.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
