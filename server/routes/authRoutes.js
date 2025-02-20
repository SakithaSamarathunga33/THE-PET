const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 🔹 Authentication Routes
router.post("/register", authController.register); // Register User
router.post("/login", authController.login); // Login User
router.get("/me", authMiddleware, authController.getUser); // Get Current User (Protected)

// 🔹 Google Authentication Routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("http://localhost:3000/home"); // Redirect to frontend
    }
);

// 🔹 User Management Routes (Google + Manually Registered Users)
router.get("/user", authController.getAllUsers); // ✅ Get all users
router.get("/user/:id", authController.getUserById); // Get user by ID
router.put("/user/:id", authController.updateUser); // Update user
router.delete("/user/:id", authController.deleteUser); // Delete user

// 🔹 Logout Route
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.json({ message: "Logged out successfully" });
    });
});

module.exports = router;
