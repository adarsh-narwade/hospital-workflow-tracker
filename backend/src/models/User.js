const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Schema = the blueprint/shape of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,  // Can't save a user without a name
      trim: true,      // Removes accidental spaces: "  John  " → "John"
    },
    email: {
      type: String,
      required: true,
      unique: true,    // No two users can share the same email
      lowercase: true, // Always saves as lowercase
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      // Only these 3 values are allowed — anything else throws an error
      enum: ["admin", "doctor", "nurse"],
      default: "nurse", // If no role is given, default to nurse
    },
    department: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true, // New accounts are active by default
    },
  },
  {
    // Automatically adds two fields to every document:
    // createdAt — when the user was created
    // updatedAt — when it was last changed
    timestamps: true,
  }
);

// This hook runs automatically BEFORE every save()
// "this" refers to the user document being saved
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Custom method added to every user document
// Lets us do: user.matchPassword("typed password")
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// This controls what gets returned when you convert a user to JSON
// We remove the password so it NEVER accidentally gets sent to the client
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// "User" → MongoDB creates a collection called "users" (lowercase + plural)
module.exports = mongoose.model("User", userSchema);