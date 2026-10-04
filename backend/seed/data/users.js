// Owner: Member A
const User = require("../../src/models/User");

const PASSWORD = "Demo1234";

const users = [
  { name: "Admin User", email: "admin@example.com", role: "admin" },
  {
    name: "Kwame Asante",
    email: "kwame@example.com",
    role: "instructor",
    bio: "Full-stack developer who has spent ten years building websites for small businesses.",
  },
  {
    name: "Ama Owusu",
    email: "ama@example.com",
    role: "instructor",
    bio: "Product designer and marketer who loves teaching beginners.",
  },
  { name: "Akosua Mensah", email: "akosua@example.com", role: "student" },
  { name: "Kojo Ansah", email: "kojo@example.com", role: "student" },
  { name: "Esi Nyarko", email: "esi@example.com", role: "student" },
];

// User.create, not insertMany: insertMany skips the pre-save hook, so passwords wouldn't be hashed.
async function seedUsers() {
  return User.create(users.map((user) => ({ ...user, password: PASSWORD })));
}

module.exports = seedUsers;
