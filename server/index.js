const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport"); // Import Passport
const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

dotenv.config();
const app = express();

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// 🔹 Middleware
app.use(express.json());
app.use(cors());

// 🔹 Session Middleware (Required for Passport)
app.use(
  session({
    secret: "your-secret-key", // Change this in production
    resave: false,
    saveUninitialized: true,
  })
);

// 🔹 Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 🔹 Routes
app.use("/api/auth", authRoutes); // Authentication & User Management
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/inventory", inventoryRoutes); // Inventory Management

// 🔹 Home Route
app.get("/", (req, res) => {
  res.send("🚀 Pet Care System API is Running...");
});

// 🔹 Server Setup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
