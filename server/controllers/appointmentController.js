const Appointment = require("../models/Appointment");
const User = require("../models/user");

const VALID_BRANCHES = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];

// @desc    Create a new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { branch } = req.body;
    
    // Validate branch
    if (!branch || !VALID_BRANCHES.includes(branch)) {
      return res.status(400).json({ 
        error: 'Invalid branch selection. Please select a valid branch.' 
      });
    }

    // If a user is logged in, use their name as the owner name
    const appointmentData = { ...req.body };
    
    if (req.user) {
      appointmentData.ownerName = req.user.name;
    } else if (!appointmentData.ownerName) {
      return res.status(400).json({
        error: 'Owner name is required when not logged in'
      });
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();
    
    // Return the complete appointment object with timestamps
    const savedAppointment = await Appointment.findById(appointment._id);
    
    res.status(201).json({ 
      message: "Appointment created successfully", 
      appointment: savedAppointment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAllAppointments = async (req, res) => {
  try {
    // Get all appointments and sort by createdAt timestamp (newest first)
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { branch } = req.body;
    
    // Validate branch for updates
    if (branch && !VALID_BRANCHES.includes(branch)) {
      return res.status(400).json({ 
        error: 'Invalid branch selection. Please select a valid branch.' 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.status(200).json({ 
      message: "Appointment updated successfully", 
      appointment 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get appointments by branch
// @route   GET /api/appointments/branch/:branchName
exports.getAppointmentsByBranch = async (req, res) => {
  try {
    const { branchName } = req.params;
    
    if (!VALID_BRANCHES.includes(branchName)) {
      return res.status(400).json({ error: 'Invalid branch name' });
    }

    const appointments = await Appointment.find({ branch: branchName }).sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Clear all appointments from database
// @route   DELETE /api/appointments/clear
exports.clearAllAppointments = async (req, res) => {
  try {
    await Appointment.deleteMany({});
    res.status(200).json({ message: "All appointments have been removed from the database" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add sample appointments (25 per branch, 100 total)
// @route   POST /api/appointments/samples
exports.addSampleAppointments = async (req, res) => {
  try {
    // First get all pets to reference in appointments
    const Pet = require('../models/Pet');
    const pets = await Pet.find();
    
    if (pets.length === 0) {
      return res.status(400).json({ 
        message: "No pets found in database. Please add pets first." 
      });
    }

    // Clear existing appointments if requested
    if (req.query.clear === 'true') {
      await Appointment.deleteMany({});
    }

    // Get real user names from the database
    const users = await User.find({ userType: 'user' });
    let userNames = users.map(user => user.name);
    
    // If we don't have enough real users, add some default names
    if (userNames.length < 10) {
      const defaultNames = [
        "Amith Perera", "Kumari Silva", "Nimal Fernando", "Sunil Gunawardena", 
        "Priya Bandara", "Kamal Rajapaksa", "Dulani Jayasuriya", "Lalith Mendis",
        "Samanthi De Silva", "Ravi Wijesekera"
      ];
      userNames = [...userNames, ...defaultNames.slice(0, 10 - userNames.length)];
    }

    const branches = VALID_BRANCHES;
    const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    const contactPrefixes = ["071", "072", "075", "077", "078"];
    
    const sampleAppointments = [];
    
    // Current date for reference
    const currentDate = new Date();
    
    // Create 25 appointments for each branch (100 total)
    for (const branch of branches) {
      for (let i = 0; i < 25; i++) {
        // Randomly select a pet for this appointment
        const pet = pets[Math.floor(Math.random() * pets.length)];
        
        // Create appointment date (between 2 months ago and 1 month in future)
        const appointmentDate = new Date(currentDate);
        appointmentDate.setDate(appointmentDate.getDate() - 60 + Math.floor(Math.random() * 90));
        
        // For past dates, use any status. For future dates, use only Pending or Confirmed
        let status;
        if (appointmentDate < currentDate) {
          status = statuses[Math.floor(Math.random() * statuses.length)];
        } else {
          status = statuses[Math.floor(Math.random() * 2)]; // Only Pending or Confirmed
        }
        
        // Generate random phone number
        const phonePrefix = contactPrefixes[Math.floor(Math.random() * contactPrefixes.length)];
        const phoneNumber = `${phonePrefix}${Math.floor(1000000 + Math.random() * 9000000)}`;
        
        // Get a random user name from our collection
        const ownerName = userNames[Math.floor(Math.random() * userNames.length)];
        
        sampleAppointments.push({
          petName: pet.breed,
          ownerName: ownerName,
          contactNumber: phoneNumber,
          appointmentDate: appointmentDate,
          reason: `Interested in ${pet.type}: ${pet.breed} (₹${pet.price})`,
          branch: branch,
          status: status
        });
      }
    }
    
    // Insert the sample appointments
    await Appointment.insertMany(sampleAppointments);
    
    res.status(201).json({ 
      message: "Sample appointments added successfully", 
      count: sampleAppointments.length,
      distribution: {
        "Colombo Branch": 25,
        "Kandy Branch": 25,
        "Galle Branch": 25,
        "Jaffna Branch": 25
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
