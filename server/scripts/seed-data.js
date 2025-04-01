// seed-data.js - Run this script to create test appointments for analytics
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create a simple Appointment schema if it doesn't exist
const appointmentSchema = new mongoose.Schema({
  petName: String,
  ownerName: String,
  contactNumber: String,
  appointmentDate: Date,
  reason: String,
  branch: String,
  status: String,
  petType: String, // Important for analytics
  createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to prevent overwriting
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

// Sample data - this creates appointmnets across different branches and pet types
const sampleAppointments = [
  // Colombo Branch
  {
    petName: 'Max',
    ownerName: 'John Smith',
    contactNumber: '1234567890',
    appointmentDate: new Date(2023, 5, 15), // June 15, 2023
    reason: 'Annual checkup',
    branch: 'Colombo Branch',
    status: 'Completed',
    petType: 'Dog',
    createdAt: new Date(2023, 5, 10) // June 10, 2023
  },
  {
    petName: 'Whiskers',
    ownerName: 'Jane Doe',
    contactNumber: '0987654321',
    appointmentDate: new Date(2023, 6, 20), // July 20, 2023
    reason: 'Vaccination',
    branch: 'Colombo Branch',
    status: 'Completed',
    petType: 'Cat',
    createdAt: new Date(2023, 6, 15) // July 15, 2023
  },
  {
    petName: 'Buddy',
    ownerName: 'Michael Wilson',
    contactNumber: '5551234567',
    appointmentDate: new Date(2023, 7, 5), // August 5, 2023
    reason: 'Skin condition',
    branch: 'Colombo Branch',
    status: 'Completed',
    petType: 'Dog',
    createdAt: new Date(2023, 7, 1) // August 1, 2023
  },
  {
    petName: 'Tweety',
    ownerName: 'Sarah Johnson',
    contactNumber: '9876543210',
    appointmentDate: new Date(2023, 8, 10), // September 10, 2023
    reason: 'Wing checkup',
    branch: 'Colombo Branch',
    status: 'Completed',
    petType: 'Bird',
    createdAt: new Date(2023, 8, 5) // September 5, 2023
  },
  {
    petName: 'Nemo',
    ownerName: 'David Brown',
    contactNumber: '1122334455',
    appointmentDate: new Date(2023, 9, 15), // October 15, 2023
    reason: 'Tank maintenance advice',
    branch: 'Colombo Branch',
    status: 'Completed',
    petType: 'Fish',
    createdAt: new Date(2023, 9, 10) // October 10, 2023
  },
  {
    petName: 'Hopper',
    ownerName: 'Emily Davis',
    contactNumber: '5566778899',
    appointmentDate: new Date(2023, 10, 20), // November 20, 2023
    reason: 'Dental check',
    branch: 'Colombo Branch',
    status: 'Completed',
    petType: 'Rabbit',
    createdAt: new Date(2023, 10, 15) // November 15, 2023
  },
  
  // Kandy Branch
  {
    petName: 'Rocky',
    ownerName: 'William Jones',
    contactNumber: '2233445566',
    appointmentDate: new Date(2023, 5, 18), // June 18, 2023
    reason: 'Injury check',
    branch: 'Kandy Branch',
    status: 'Completed',
    petType: 'Dog',
    createdAt: new Date(2023, 5, 13) // June 13, 2023
  },
  {
    petName: 'Mittens',
    ownerName: 'Jennifer Garcia',
    contactNumber: '7788990011',
    appointmentDate: new Date(2023, 6, 25), // July 25, 2023
    reason: 'Annual checkup',
    branch: 'Kandy Branch',
    status: 'Completed',
    petType: 'Cat',
    createdAt: new Date(2023, 6, 20) // July 20, 2023
  },
  {
    petName: 'Chirp',
    ownerName: 'Robert Miller',
    contactNumber: '8899001122',
    appointmentDate: new Date(2023, 7, 8), // August 8, 2023
    reason: 'Feather problem',
    branch: 'Kandy Branch',
    status: 'Completed',
    petType: 'Bird',
    createdAt: new Date(2023, 7, 3) // August 3, 2023
  },
  
  // Galle Branch
  {
    petName: 'Spot',
    ownerName: 'Patricia Martinez',
    contactNumber: '3344556677',
    appointmentDate: new Date(2023, 8, 12), // September 12, 2023
    reason: 'Vaccination',
    branch: 'Galle Branch',
    status: 'Completed',
    petType: 'Dog',
    createdAt: new Date(2023, 8, 7) // September 7, 2023
  },
  {
    petName: 'Fluffy',
    ownerName: 'Thomas Anderson',
    contactNumber: '6677889900',
    appointmentDate: new Date(2023, 9, 18), // October 18, 2023
    reason: 'Grooming',
    branch: 'Galle Branch',
    status: 'Completed',
    petType: 'Cat',
    createdAt: new Date(2023, 9, 13) // October 13, 2023
  },
  
  // Jaffna Branch
  {
    petName: 'Rex',
    ownerName: 'Jessica Lee',
    contactNumber: '9900112233',
    appointmentDate: new Date(2023, 10, 22), // November 22, 2023
    reason: 'Behavioral training',
    branch: 'Jaffna Branch',
    status: 'Completed',
    petType: 'Dog',
    createdAt: new Date(2023, 10, 17) // November 17, 2023
  },
  {
    petName: 'Goldie',
    ownerName: 'Daniel Hernandez',
    contactNumber: '0011223344',
    appointmentDate: new Date(2023, 11, 5), // December 5, 2023
    reason: 'Water quality check',
    branch: 'Jaffna Branch',
    status: 'Completed',
    petType: 'Fish',
    createdAt: new Date(2023, 11, 1) // December 1, 2023
  },
  
  // Recent appointments (current month)
  {
    petName: 'Luna',
    ownerName: 'Kevin Wilson',
    contactNumber: '1231231234',
    appointmentDate: new Date(), // Today
    reason: 'Regular checkup',
    branch: 'Colombo Branch',
    status: 'Pending',
    petType: 'Cat',
    createdAt: new Date(Date.now() - 86400000) // Yesterday
  },
  {
    petName: 'Cooper',
    ownerName: 'Amanda Thompson',
    contactNumber: '9879879876',
    appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
    reason: 'Vaccination',
    branch: 'Kandy Branch',
    status: 'Pending',
    petType: 'Dog',
    createdAt: new Date(Date.now() - 172800000) // 2 days ago
  }
];

// Seed the database
async function seedDatabase() {
  try {
    // Check if there are already appointments
    const count = await Appointment.countDocuments();
    
    if (count > 0) {
      console.log(`Database already has ${count} appointments. Skipping seeding to avoid duplicates.`);
      console.log('If you want to add more test data, first clear existing appointments.');
    } else {
      // Insert the sample appointments
      await Appointment.insertMany(sampleAppointments);
      console.log(`Successfully seeded ${sampleAppointments.length} test appointments!`);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seeding function
seedDatabase(); 