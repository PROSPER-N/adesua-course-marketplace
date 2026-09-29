// Runs before every test file: connects to YOUR test database and empties it after each test.
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

const { MONGO_URI, MONGO_URI_TEST, JWT_SECRET } = process.env;

// Tests delete data, so they must never run against your dev database.
if (!MONGO_URI_TEST) {
  throw new Error("MONGO_URI_TEST is missing in backend/.env. Tests need their own database.");
}
if (MONGO_URI_TEST === MONGO_URI) {
  throw new Error(
    "MONGO_URI_TEST is the same as MONGO_URI. Use a separate database (adesua_test_<name>) " +
      "so tests can't wipe your dev data."
  );
}
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in backend/.env. Tests need it to create login tokens.");
}

// Stays false unless the database name check below passes, so we never empty the wrong database.
let isSafeToClear = false;

beforeAll(async () => {
  // autoIndex/autoCreate off: otherwise Mongoose starts creating collections the moment it
  // connects, before we've checked that this is really a test database.
  await mongoose.connect(MONGO_URI_TEST, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: false,
    autoCreate: false,
  });

  // "test" on its own is MongoDB's default when the URI has no database name,
  // and the whole team could be sharing it.
  const dbName = mongoose.connection.name;
  if (dbName === "test" || !dbName.includes("test")) {
    await mongoose.disconnect();
    throw new Error(
      `Refusing to run tests on the database "${dbName}". ` +
        'Use your own test database with "test" in its name, like adesua_test_<name>.'
    );
  }
  isSafeToClear = true;

  // Now that it's safe, build the unique indexes (like email), so duplicates really get a 409.
  await Promise.all(Object.values(mongoose.models).map((model) => model.createIndexes()));
});

afterEach(async () => {
  if (!isSafeToClear) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
