const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 🔹 Register New User
exports.register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Check if user already exists (email or username)
    let user = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    if (user) {
      return res.status(400).json({ 
        message: "User already exists with this email or username" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      userType: "user" // Default to regular user
    });

    await user.save();
    
    // Generate token
    const token = generateToken(user);

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Login User
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Special case for admin
    if ((identifier === 'admin' || identifier === 'admin@gmail.com') && password === 'admin123') {
      const adminUser = await User.findOne({ 
        $or: [
          { username: 'admin' },
          { email: 'admin@gmail.com' }
        ]
      });

      if (adminUser) {
        const token = generateToken(adminUser);
        console.log('Admin login successful');
        return res.json({
          token,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            username: adminUser.username,
            userType: 'admin'
          }
        });
      }
    }

    // Regular login flow
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password'); // Explicitly select password field

    if (!user) {
      return res.status(400).json({ message: "Invalid email/username or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email/username or password" });
    }

    // Generate token
    const token = generateToken(user);
    console.log('Login successful - User type:', user.userType);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Get Current User (Protected)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

// ✅ Get All Users (Google + Manually Registered)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// 🔹 Get Single User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Update User
exports.updateUser = async (req, res) => {
  try {
    const { name, email, username, userType } = req.body;
    const userId = req.params.id;

    // Check if username already exists for another user
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: userId } // Exclude current user from check
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: "Username already taken" 
      });
    }

    // Find user and update all fields
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        username,
        userType
      },
      { new: true } // Return the updated document
    ).select('-password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// 🔹 Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Logout User
exports.logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

// Handle Google Authentication
exports.handleGoogleAuth = async (profile) => {
  try {
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name: profile.name,
        email: profile.email,
        googleId: profile.id,
        userType: "user", // Default to regular user
      });
      await user.save();
    } else if (!user.googleId) {
      // Update existing user with Google ID if they previously registered with email
      user.googleId = profile.id;
      await user.save();
    }

    return user;
  } catch (error) {
    console.error("Error handling Google auth:", error);
    throw error;
  }
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      userType: user.userType // Include userType in token
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Export the generateToken function
exports.generateToken = generateToken;
