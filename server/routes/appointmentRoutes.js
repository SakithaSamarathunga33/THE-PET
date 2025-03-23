const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByBranch,
  clearAllAppointments,
  addSampleAppointments
} = require("../controllers/appointmentController");
const { protect, adminOnly, optional } = require("../middleware/authMiddleware");

// Routes that need authentication
router.post("/", optional, createAppointment);  // Optional auth to allow both logged-in and guest users
router.get("/", protect, getAllAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, deleteAppointment);
router.get("/branch/:branchName", protect, getAppointmentsByBranch);

// Admin-only routes
router.delete("/clear/all", protect, adminOnly, clearAllAppointments);
router.post("/samples", protect, adminOnly, addSampleAppointments);

// TEMPORARY PUBLIC ROUTES FOR TESTING - REMOVE AFTER TESTING
router.get("/public/setup", async (req, res) => {
  try {
    // Clear all appointments
    await require("../models/Appointment").deleteMany({});
    
    // Generate sample appointments
    const sampleController = require('../controllers/appointmentController');
    await sampleController.addSampleAppointments({
      query: { clear: 'false' } // We've already cleared them
    }, {
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      json: (data) => {
        res.json({
          message: "Appointments have been reset. Please login again to see them.",
          details: data
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to reset appointments", 
      details: error.message 
    });
  }
});

module.exports = router;
