// Runs before every test file: connects to your test database and empties it after each test.
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

// Atlas can be slow to reach on some networks (for example when DNS lookups stall),
// so the connection gets up to 60 seconds before the tests stop with a clear message.
const CONNECT_TIMEOUT_MS = 60000;
// The "mongodb+srv://" DNS lookup runs before those 60 seconds start, so Jest's limit for
// this step is longer. That way you see the clear message below, not Jest's "Exceeded timeout".
const SETUP_TIMEOUT_MS = CONNECT_TIMEOUT_MS + 30000;

beforeAll(async () => {
  // autoIndex/autoCreate off: otherwise Mongoose starts creating collections the moment it
  // connects, before we've checked that this is really a test database.
  try {
    await mongoose.connect(MONGO_URI_TEST, {
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
      autoIndex: false,
      autoCreate: false,
      // The driver loads "os" with import(), which Jest blocks, so it would send an empty
      // handshake that a plain mongod (like CI's) refuses. Remove once NODE-7832 is fixed.
      runtimeAdapters: { os: require("os") },
    });
  } catch (error) {
    throw new Error(
      "Couldn't connect to the test database within 60 seconds. Check your internet connection, " +
        "MONGO_URI_TEST in backend/.env, and that your IP address is allowed in Atlas " +
        `(Network Access). Details: ${error.message}`
    );
  }

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
}, SETUP_TIMEOUT_MS);

// Atlas can also be slow to answer here, so the cleanup gets as long as the connection does
// instead of Jest's usual hook limit.
afterEach(async () => {
  if (!isSafeToClear) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}, CONNECT_TIMEOUT_MS);

afterAll(async () => {
  await mongoose.disconnect();
});
