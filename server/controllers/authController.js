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

    // Special case for admin with simplified credentials
    if (identifier === 'admin' && password === 'admin') {
      console.log('Admin credentials detected');
      
      // Find admin user or create if doesn't exist
      let adminUser = await User.findOne({ username: 'admin' });
      
      if (!adminUser) {
        // Create admin user if it doesn't exist
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);
        
        adminUser = new User({
          username: 'admin',
          name: 'Admin User',
          email: 'admin@petcare.com',
          password: hashedPassword,
          userType: 'admin'
        });
        
        await adminUser.save();
        console.log('Admin user created');
      }
      
      // Generate token for admin
      const token = generateToken(adminUser);
      
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

    // Regular login flow
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).select('+password').populate('employeeId'); // Populate employee data if it exists

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
        userType: user.userType,
        employeeId: user.employeeId ? user.employeeId._id : null
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

// 🔹 Link User to Employee
exports.linkUserToEmployee = async (req, res) => {
  try {
    const { userId, employeeId } = req.body;
    
    console.log('Linking user to employee:', { userId, employeeId });
    
    if (!userId || !employeeId) {
      return res.status(400).json({ message: "User ID and Employee ID are required" });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify the employee exists
    const Employee = require('../models/Employee');
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Update user with employee ID and change userType to employee
    user.employeeId = employeeId;
    user.userType = "employee";
    
    await user.save();
    console.log('User linked to employee successfully:', user.username);
    
    res.status(200).json({ 
      success: true,
      message: "User linked to employee successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        userType: user.userType,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error("Link user to employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Unlink User from Employee
exports.unlinkUserFromEmployee = async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('Unlinking user from employee:', { userId });
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user is actually linked to an employee
    if (!user.employeeId) {
      return res.status(400).json({ message: "User is not linked to any employee" });
    }
    
    // Update user to remove employee ID and change userType back to regular user
    user.employeeId = null;
    user.userType = "user";
    
    await user.save();
    console.log('User unlinked from employee successfully:', user.username);
    
    res.status(200).json({ 
      success: true,
      message: "User unlinked from employee successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        userType: user.userType,
        employeeId: null
      }
    });
  } catch (error) {
    console.error("Unlink user from employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Create Sample Employee User (For Testing)
exports.createSampleEmployeeUser = async (req, res) => {
  try {
    // Check if sample employee already exists
    let employee = await Employee.findOne({ email: 'john.smith@petcare.com' });
    
    if (!employee) {
      // Create new employee
      employee = new Employee({
        name: 'John Smith',
        email: 'john.smith@petcare.com',
        phoneNumber: '555-123-4567',
        role: 'Veterinarian',
        baseSalary: 5000,
        hourlyRate: 25,
        workingHoursPerDay: 8,
        address: '123 Pet Street, Petville, PC 12345',
        status: 'Active',
        joiningDate: new Date('2023-01-15'),
        attendance: [
          {
            date: new Date('2023-05-01'),
            present: true,
            checkIn: new Date('2023-05-01T09:00:00'),
            checkOut: new Date('2023-05-01T17:00:00'),
            hoursWorked: 8
          },
          {
            date: new Date('2023-05-02'),
            present: true,
            checkIn: new Date('2023-05-02T08:45:00'),
            checkOut: new Date('2023-05-02T17:15:00'),
            hoursWorked: 8.5
          },
          {
            date: new Date('2023-05-03'),
            present: false
          }
        ],
        leaves: [
          {
            type: 'Vacation',
            startDate: new Date('2023-06-10'),
            endDate: new Date('2023-06-15'),
            approved: true,
            paid: true
          }
        ],
        overtime: [
          {
            date: new Date('2023-05-15'),
            hours: 3,
            approved: true,
            rate: 1.5
          }
        ]
      });
      
      await employee.save();
      console.log('Sample employee created');
    } else {
      console.log('Sample employee already exists');
    }

    // Check if user already exists
    let user = await User.findOne({ username: 'employee' });
    
    if (!user) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123!', salt);
      
      // Create new user
      user = new User({
        username: 'employee',
        name: 'John Smith',
        email: 'john.smith@petcare.com',
        password: hashedPassword,
        userType: 'employee',
        employeeId: employee._id
      });
      
      await user.save();
      console.log('Sample user created');
    } else {
      // Update existing user
      user.userType = 'employee';
      user.employeeId = employee._id;
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123!', salt);
      user.password = hashedPassword;
      
      await user.save();
      console.log('Sample user updated');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Sample employee user created successfully',
      loginCredentials: {
        username: 'employee',
        password: 'Password123!',
        userType: 'employee'
      }
    });
  } catch (error) {
    console.error('Error creating sample employee user:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
