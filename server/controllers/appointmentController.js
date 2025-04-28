const Appointment = require("../models/Appointment");
const User = require("../models/User"); // Fixed casing to match actual file
const Pet = require("../models/Pet");

const VALID_BRANCHES = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];

// @desc    Create a new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { contactNumber, appointmentDate, reason, branch, petType } = req.body;
    
    // Enhanced validation
    
    // 1. Validate branch
    if (!branch || !VALID_BRANCHES.includes(branch)) {
      return res.status(400).json({ 
        error: 'Invalid branch selection. Please select a valid branch.' 
      });
    }
    
    // 2. Validate contact number format
    const phoneRegex = /^(?:\+\d{1,3})?\s?\d{9,15}$/;
    if (!contactNumber || !phoneRegex.test(contactNumber)) {
      return res.status(400).json({
        error: 'Please provide a valid contact number'
      });
    }
    
    // 3. Validate appointment date (not in the past)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);  // Start of today
    
    if (!appointmentDate || new Date(appointmentDate) < currentDate) {
      return res.status(400).json({
        error: 'Appointment date cannot be in the past'
      });
    }
    
    // 4. Validate pet type
    const VALID_PET_TYPES = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'];
    if (!petType || !VALID_PET_TYPES.includes(petType)) {
      return res.status(400).json({
        error: 'Valid pet type is required'
      });
    }
    
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        error: 'Reason is required and must be at least 5 characters long'
      });
    }
    
    // If a user is logged in, use their name as the buyer name
    const appointmentData = { ...req.body };
    
    if (req.user) {
      // Only use user's name if no ownerName was provided
      if (!appointmentData.ownerName) {
        appointmentData.ownerName = req.user.name;
      }
    } else if (!appointmentData.ownerName || appointmentData.ownerName.trim().length < 2) {
      return res.status(400).json({
        error: 'Buyer name is required when not logged in and must be at least 2 characters long'
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
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    
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
    // Get all pets from the database
    const pets = await Pet.find();
    if (!pets || pets.length === 0) {
      return res.status(400).json({ message: 'No pets found in the database' });
    }

    // Clear existing appointments if requested
    if (req.query.clear === 'true') {
      await Appointment.deleteMany({});
    }

    // Get real user names from the database
    const users = await User.find().select('name');
    const userNames = users.map(user => user.name);
    
    // Add some default names if we have fewer than 10 users
    const defaultNames = [
      'John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis', 'David Lee',
      'Lisa Anderson', 'James Wilson', 'Maria Garcia', 'Robert Taylor', 'Jennifer White'
    ];
    
    const allNames = [...new Set([...userNames, ...defaultNames])].slice(0, 10);

    // Define branch distribution
    const branchDistribution = {
      'Colombo Branch': 8,
      'Kandy Branch': 7,
      'Galle Branch': 7,
      'Jaffna Branch': 7
    };

    const sampleAppointments = [];
    const today = new Date();
    const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'];
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    // Generate appointments for each branch
    for (const [branch, count] of Object.entries(branchDistribution)) {
      for (let i = 0; i < count; i++) {
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 30)); // Random date within next 30 days
        
        const randomPet = pets[Math.floor(Math.random() * pets.length)];
        const randomOwner = allNames[Math.floor(Math.random() * allNames.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomPetType = petTypes[Math.floor(Math.random() * petTypes.length)];
        
        // Generate a random phone number
        const phoneNumber = `+94${Math.floor(Math.random() * 900000000 + 100000000)}`;

        sampleAppointments.push({
          petType: randomPetType,
          ownerName: randomOwner,
          contactNumber: phoneNumber,
          appointmentDate: appointmentDate,
          reason: `Sample appointment for ${randomPetType} at ${branch}`,
          branch: branch,
          status: randomStatus
        });
      }
    }

    // Insert all appointments
    const result = await Appointment.insertMany(sampleAppointments);

    res.status(201).json({
      message: `Successfully added ${result.length} sample appointments`,
      distribution: branchDistribution
    });
  } catch (error) {
    console.error('Error adding sample appointments:', error);
    res.status(500).json({ message: 'Error adding sample appointments', error: error.message });
  }
};
