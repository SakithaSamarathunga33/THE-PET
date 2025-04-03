const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"]
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email address"]
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters long"]
  },
  userType: {
    type: String,
    enum: {
      values: ["admin", "user", "employee"],
      message: "{VALUE} is not a valid user type"
    },
    default: "user",
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  googleId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
