const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const NAME_MSG = "Name must be between 2 and 50 characters.";
const HEADLINE_MSG = "Add a short headline, like Web developer and teacher.";
const INTERESTS_MSG = "Choose up to 5 interests.";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, NAME_MSG],
      trim: true,
      minlength: [2, NAME_MSG],
      maxlength: [50, NAME_MSG],
    },
    email: {
      type: String,
      required: [true, "Enter a valid email address."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password must be at least 8 characters and include a letter and a number."],
      minlength: [8, "Password must be at least 8 characters and include a letter and a number."],
      select: false, // never loaded unless a query asks for it with .select("+password")
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, "Bio can't be more than 300 characters."],
      default: "",
    },
    // Instructors only. Shown under their name on their course pages.
    headline: {
      type: String,
      trim: true,
      maxlength: [80, HEADLINE_MSG],
    },
    // Instructors only.
    teachingArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    // Students only. No default, so instructors and admins don't get an empty list.
    interests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      default: undefined,
      validate: {
        validator: (interests) => interests.length <= 5,
        message: INTERESTS_MSG,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Runs whenever a user is sent in a response, so the password hash never leaves the server.
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash the password before saving, but only when it was set or changed.
// Otherwise saving a user for another reason would hash the hash again.
// (Mongoose 9: hooks are async functions and don't receive next.)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// The user must have been loaded with .select("+password") for this to work.
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
