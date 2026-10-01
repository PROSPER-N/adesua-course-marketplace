const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const NAME_MSG = "Category name must be between 2 and 40 characters.";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, NAME_MSG],
      unique: true,
      trim: true,
      minlength: [2, NAME_MSG],
      maxlength: [40, NAME_MSG],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

// Build the slug from the name, so "Web development" gets "web-development".
// This runs on create() and save(), but not on findByIdAndUpdate(),
// so to rename a category, load it, change the name, then call save().
categorySchema.pre("validate", async function () {
  if (this.name && this.isModified("name")) {
    this.slug = slugify(this.name);
  }
});

module.exports = mongoose.model("Category", categorySchema);
