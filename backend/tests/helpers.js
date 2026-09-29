// Shared test helpers. Everyone can reuse these in their own test files.
const User = require("../src/models/User");
const generateToken = require("../src/utils/generateToken");

const TEST_PASSWORD = "Demo1234";

let userCount = 0;

// Creates a user in the test database. Every call gets a new email.
// Examples: createUser(), createUser({ role: "instructor" }), createUser({ isActive: false })
async function createUser({ role = "student", isActive = true } = {}) {
  userCount += 1;
  return User.create({
    name: `Test ${role} ${userCount}`,
    email: `${role}${userCount}@test.com`,
    password: TEST_PASSWORD,
    role,
    isActive,
  });
}

// A login token for that user. Send it as: .set("Authorization", `Bearer ${tokenFor(user)}`)
function tokenFor(user) {
  return generateToken(user._id);
}

module.exports = { createUser, tokenFor, TEST_PASSWORD };
