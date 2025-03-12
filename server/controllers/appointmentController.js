const Appointment = require("../models/Appointment");

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

    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json({ 
      message: "Appointment created successfully", 
      appointment 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
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

    const appointments = await Appointment.find({ branch: branchName });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
