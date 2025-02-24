const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport"); // Import Passport
const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes"); // Inventory Management
const employeeRoutes = require('./routes/employeeRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const forumRoutes = require('./routes/forumRoutes');

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
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔹 Session Middleware (Required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// 🔹 Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 🔹 Routes
app.get("/auth/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "http://localhost:3000/login",
    session: false 
  }),
  (req, res) => {
    try {
      const token = req.user.token;
      
      if (!token) {
        console.error("No token generated for user");
        return res.redirect("http://localhost:3000/login?error=authentication_failed");
      }

      // Redirect to the callback page with the token
      res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("http://localhost:3000/login?error=server_error");
    }
  }
);

// Google auth route
app.get("/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

app.use("/api/auth", authRoutes); // Authentication & User Management
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/inventory", inventoryRoutes); // Inventory Management
app.use('/api/employees', employeeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/forum', forumRoutes);

// 🔹 Home Route
app.get("/", (req, res) => {
  res.send("🚀 Pet Care System API is Running...");
});

// 🔹 Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 🔹 Server Setup
const PORT = process.env.PORT || 5000; // Changed to 5000 to match frontend config
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔑 Google Auth callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
});
