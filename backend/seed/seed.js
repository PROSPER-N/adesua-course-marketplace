// Wipes your dev database (the one in MONGO_URI) and fills it with demo data.
// Run it with: npm run seed -- --yes

require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

const seedUsers = require("./data/users");
const seedCategories = require("./data/categories");
const seedCourses = require("./data/courses");
const seedEnrollments = require("./data/enrollments");
const seedReviews = require("./data/reviews");

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in backend/.env.");
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const dbName = mongoose.connection.name;
  console.log(`Connected to database: ${dbName}`);

  // "test" is the database MongoDB uses when the URI has no name, so the whole team could be sharing it.
  if (dbName === "test") {
    console.error('Refusing to seed the default "test" database.');
    console.error("Put your own database name (adesua_dev_<name>) in MONGO_URI.");
    process.exitCode = 1;
    return;
  }

  if (!process.argv.includes("--yes")) {
    console.error(`This deletes everything in "${dbName}" and adds demo data.`);
    console.error("If that's OK, run: npm run seed -- --yes");
    process.exitCode = 1;
    return;
  }

  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  console.log(`Cleared ${collections.length} collection(s).`);

  // Each seeder gets what the earlier ones created, e.g. courses need users and categories.
  const categories = await seedCategories();
  const users = await seedUsers({ categories });
  const courses = await seedCourses({ users, categories });
  const enrollments = await seedEnrollments({ users, categories, courses });
  const reviews = await seedReviews({ users, courses, enrollments });

  console.log(
    `Created ${users.length} users, ${categories.length} categories, ${courses.length} courses, ` +
      `${enrollments.length} enrollments and ${reviews.length} reviews.`
  );
  console.log("\nTest accounts (every password is Demo1234):");
  console.table(users.map((user) => ({ name: user.name, email: user.email, role: user.role })));
}

seed()
  .catch((error) => {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
