// Owner: Member A
const User = require("../../src/models/User");

const PASSWORD = "Demo1234";

// Teaching areas and interests are category names here. seedUsers swaps them for the IDs.
const users = [
  { name: "Admin User", email: "admin@example.com", role: "admin" },
  {
    name: "Kwame Asante",
    email: "kwame@example.com",
    role: "instructor",
    bio: "Full-stack developer who has spent ten years building websites for small businesses.",
    headline: "Full-stack developer and teacher",
    teachingArea: "Web development",
  },
  {
    name: "Ama Owusu",
    email: "ama@example.com",
    role: "instructor",
    bio: "Product designer and marketer who loves teaching beginners.",
    headline: "Product designer and marketer",
    teachingArea: "Design",
  },
  {
    name: "Chiamaka Obi",
    email: "chiamaka@example.com",
    role: "instructor",
    bio: "Social media manager who plans content for small brands and teaches the routines behind it.",
    headline: "Social media manager and content planner",
    teachingArea: "Marketing",
  },
  {
    name: "Tomás Ortega",
    email: "tomas@example.com",
    role: "instructor",
    bio: "Documentary photographer who photographs people at work, often with nothing more than a phone.",
    headline: "Documentary photographer",
    teachingArea: "Photography",
  },
  {
    name: "Meera Pillai",
    email: "meera@example.com",
    role: "instructor",
    bio: "Small business adviser who helps first-time founders plan their offer, their prices and their week.",
    headline: "Small business adviser and coach",
    teachingArea: "Business",
  },
  {
    name: "Akosua Mensah",
    email: "akosua@example.com",
    role: "student",
    interests: ["Web development", "Programming"],
  },
  {
    name: "Kojo Ansah",
    email: "kojo@example.com",
    role: "student",
    interests: ["Business", "Marketing"],
  },
  {
    name: "Esi Nyarko",
    email: "esi@example.com",
    role: "student",
    interests: ["Design", "Photography"],
  },
];

// "categories" are the documents created by the categories seeder.
// User.create, not insertMany: insertMany skips the pre-save hook, so passwords wouldn't be hashed.
async function seedUsers({ categories }) {
  const idOf = (name) => categories.find((category) => category.name === name)._id;

  return User.create(
    users.map(({ teachingArea, interests, ...user }) => {
      const profile = {};
      if (teachingArea) profile.teachingArea = idOf(teachingArea);
      if (interests) profile.interests = interests.map(idOf);
      return { ...user, ...profile, password: PASSWORD };
    })
  );
}

module.exports = seedUsers;
