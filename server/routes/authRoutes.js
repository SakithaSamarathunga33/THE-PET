const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Authentication Routes
router.post("/register", authController.register); // Register User
router.post("/login", authController.login); // Login User
router.get("/me", protect, authController.getUser); // Get Current User (Protected)

// 🔹 Google Authentication Routes
router.get(
    "/google",
    passport.authenticate("google", { 
        scope: ["profile", "email"],
        session: false 
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { 
        session: false,
        failureRedirect: "http://localhost:3000/login" 
    }),
    (req, res) => {
        const token = req.user.token;
        res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    }
);

// 🔹 User Management Routes (Google + Manually Registered Users)
router.get("/user", authController.getAllUsers); // ✅ Get all users
router.get("/user/:id", authController.getUserById); // Get user by ID
router.put("/user/:id", authController.updateUser); // Update user
router.delete("/user/:id", authController.deleteUser); // Delete user

// 🔹 Employee User Management
router.post("/link-employee", protect, authController.linkUserToEmployee); // Link user to employee
router.post("/unlink-employee", protect, authController.unlinkUserFromEmployee); // Unlink user from employee

// 🔹 Sample Data (For Testing)
router.post("/create-sample-employee", authController.createSampleEmployeeUser); // Create sample employee user

// 🔹 Logout Route
router.post("/logout", protect, authController.logout);

module.exports = router;
