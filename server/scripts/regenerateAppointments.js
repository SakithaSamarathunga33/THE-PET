/**
 * Script to delete all appointments and regenerate new ones with realistic data
 * Uses Pet model to get real pet types and User model for user data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load models
const Pet = require('../models/Pet');
const User = require('../models/User');
const Appointment = mongoose.models.Appointment || 
  mongoose.model('Appointment', new mongoose.Schema({
    petName: String,
    ownerName: String,
    contactNumber: String,
    appointmentDate: Date,
    reason: String,
    branch: String,
    status: String,
    petType: String,
    createdAt: { type: Date, default: Date.now }
  }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Generate a random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// List of common appointment reasons by pet type
const appointmentReasons = {
  Dog: [
    'Annual checkup and vaccinations',
    'Skin issues and itching',
    'Ear infection',
    'Limping/joint pain',
    'Dental cleaning',
    'Digestive issues',
    'Behavioral consultation'
  ],
  Cat: [
    'Annual wellness exam',
    'Dental cleaning',
    'Vaccination updates',
    'Urinary tract issues',
    'Hairball problems',
    'Weight management',
    'Grooming'
  ],
  Bird: [
    'Wing clipping',
    'Beak trimming',
    'Annual health check',
    'Nutritional consultation',
    'Respiratory issues',
    'Feather loss assessment'
  ],
  Fish: [
    'Water quality consultation',
    'Parasite treatment',
    'Fin rot assessment',
    'Nutritional guidance',
    'Tank setup advice'
  ],
  Rabbit: [
    'Dental checkup',
    'Nail trimming',
    'Digestive health assessment',
    'Annual checkup',
    'Spay/neuter consultation'
  ]
};

// Generic reasons for any pet type
const genericReasons = [
  'Regular checkup',
  'Vaccination',
  'Minor injury',
  'Illness symptoms',
  'Follow-up appointment',
  'New pet consultation',
  'Emergency visit'
];

// Generate an appointment with realistic data
const generateAppointment = (users, petTypes, pastDate = false) => {
  // Random user selection
  const user = users[Math.floor(Math.random() * users.length)];
  
  // Random pet type selection (higher probability for dogs and cats)
  let petType;
  const rand = Math.random();
  if (rand < 0.4) {
    petType = 'Dog';
  } else if (rand < 0.7) {
    petType = 'Cat';
  } else if (rand < 0.85) {
    petType = 'Bird';
  } else if (rand < 0.95) {
    petType = 'Rabbit';
  } else {
    petType = 'Fish';
  }
  
  // If no pet type probability matched or we want to stay loyal to database
  if (!petTypes.includes(petType)) {
    petType = petTypes[Math.floor(Math.random() * petTypes.length)];
  }
  
  // Select a random pet name
  const petNames = {
    Dog: ['Max', 'Buddy', 'Charlie', 'Rocky', 'Bear', 'Duke', 'Tucker', 'Oliver', 'Milo', 'Simba'],
    Cat: ['Luna', 'Lily', 'Kitty', 'Bella', 'Lucy', 'Nala', 'Chloe', 'Stella', 'Zoe', 'Cleo'],
    Bird: ['Kiwi', 'Sunny', 'Rio', 'Tweety', 'Sky', 'Blue', 'Polly', 'Mango', 'Piper', 'Robin'],
    Fish: ['Bubbles', 'Nemo', 'Dory', 'Splash', 'Goldie', 'Finn', 'Marlin', 'Coral', 'Flipper', 'Wave'],
    Rabbit: ['Thumper', 'Hopper', 'Snowball', 'Flopsy', 'Cottonball', 'Bugs', 'Clover', 'Cinnamon', 'Oreo', 'Pepper']
  };
  
  const petName = petNames[petType][Math.floor(Math.random() * petNames[petType].length)];
  
  // Branch distribution (different numbers per branch)
  const branches = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];
  // Weight probabilities: Colombo highest, then Kandy, Galle, Jaffna lowest
  const branchProbabilities = [0.4, 0.3, 0.2, 0.1]; 
  
  let branch;
  const branchRand = Math.random();
  let cumulativeProbability = 0;
  
  for (let i = 0; i < branches.length; i++) {
    cumulativeProbability += branchProbabilities[i];
    if (branchRand <= cumulativeProbability) {
      branch = branches[i];
      break;
    }
  }
  
  // Get appointment date (past 6 months to future 2 months)
  const now = new Date();
  let startDate, endDate;
  
  if (pastDate) {
    // Past appointment (up to 6 months ago)
    startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    // Future appointment (up to 2 months in the future)
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());
  }
  
  const appointmentDate = randomDate(startDate, endDate);
  
  // Get reason based on pet type
  const specificReasons = appointmentReasons[petType] || genericReasons;
  const reason = specificReasons[Math.floor(Math.random() * specificReasons.length)];
  
  // Random status (mostly confirmed for future, mostly completed for past)
  const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const statusWeights = pastDate 
    ? [0.05, 0.10, 0.75, 0.10] // Past appointments
    : [0.30, 0.60, 0.00, 0.10]; // Future appointments
  
  let status;
  const statusRand = Math.random();
  let cumulativeStatusProb = 0;
  
  for (let i = 0; i < statuses.length; i++) {
    cumulativeStatusProb += statusWeights[i];
    if (statusRand <= cumulativeStatusProb) {
      status = statuses[i];
      break;
    }
  }
  
  // Generate a random contact number
  const contactNumber = `+94${Math.floor(Math.random() * 900000000) + 100000000}`;
  
  return {
    petName,
    ownerName: user.name,
    contactNumber,
    appointmentDate,
    reason,
    branch,
    status,
    petType
  };
};

// Main function to regenerate appointments
const regenerateAppointments = async () => {
  try {
    // Connect to database
    const conn = await connectDB();
    console.log('Connected to database...');
    
    // Delete all existing appointments
    console.log('Deleting existing appointments...');
    const deleteResult = await Appointment.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} appointments`);
    
    // Get all users
    const users = await User.find({}).lean();
    if (users.length === 0) {
      console.error('No users found in the database. Please add users first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users`);
    
    // Get all pet types from the Pet model
    const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'];
    console.log(`Using pet types: ${petTypes.join(', ')}`);
    
    // Generate exactly 139 appointments with specific distribution
    const totalAppointments = 139;
    console.log(`Generating ${totalAppointments} appointments...`);
    
    // Define branch distribution
    const branchDistribution = {
      'Colombo Branch': 45,  // ~32%
      'Kandy Branch': 35,    // ~25%
      'Galle Branch': 35,    // ~25%
      'Jaffna Branch': 24    // ~18%
    };
    
    const allAppointments = [];
    
    // Generate appointments for each branch
    for (const [branch, count] of Object.entries(branchDistribution)) {
      console.log(`Generating ${count} appointments for ${branch}...`);
      
      for (let i = 0; i < count; i++) {
        // Determine if this should be a past or future appointment
        const isPast = Math.random() < 0.7; // 70% past, 30% future
        allAppointments.push(generateAppointment(users, petTypes, isPast));
      }
    }
    
    // Insert all appointments
    console.log(`Inserting ${allAppointments.length} total appointments...`);
    const insertResult = await Appointment.insertMany(allAppointments);
    console.log(`Successfully inserted ${insertResult.length} appointments`);
    
    // Count by branch
    const branchCounts = await Appointment.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } }
    ]);
    
    console.log('\nAppointment counts by branch:');
    branchCounts.forEach(branch => {
      console.log(`${branch._id}: ${branch.count} appointments`);
    });
    
    // Count by pet type
    const petTypeCounts = await Appointment.aggregate([
      { $group: { _id: '$petType', count: { $sum: 1 } } }
    ]);
    
    console.log('\nAppointment counts by pet type:');
    petTypeCounts.forEach(type => {
      console.log(`${type._id}: ${type.count} appointments`);
    });
    
    console.log('\nAppointment regeneration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error regenerating appointments:', error);
    process.exit(1);
  }
};

// Run the script
regenerateAppointments(); 