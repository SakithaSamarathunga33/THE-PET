const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

// Sample pet names and breeds for realistic data
const petTypes = [
  { name: 'Max', type: 'Dog', breed: 'Golden Retriever' },
  { name: 'Luna', type: 'Cat', breed: 'Persian' },
  { name: 'Charlie', type: 'Dog', breed: 'Labrador' },
  { name: 'Bella', type: 'Cat', breed: 'Siamese' },
  { name: 'Rocky', type: 'Dog', breed: 'German Shepherd' },
  { name: 'Milo', type: 'Cat', breed: 'Maine Coon' }
];

const branches = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];
const reasons = [
  'Regular checkup',
  'Vaccination',
  'Grooming session',
  'Health issue',
  'Dental cleaning',
  'Emergency visit'
];

const generateRandomAppointments = (count) => {
  const appointments = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-06-30');

  for (let i = 0; i < count; i++) {
    const randomPet = petTypes[Math.floor(Math.random() * petTypes.length)];
    const randomBranch = branches[Math.floor(Math.random() * branches.length)];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    const status = Math.random() > 0.7 ? 'Completed' : 
                   Math.random() > 0.4 ? 'Confirmed' : 
                   Math.random() > 0.2 ? 'Pending' : 'Cancelled';

    appointments.push({
      petName: randomPet.name,
      ownerName: `Owner of ${randomPet.name}`,
      contactNumber: `+94${Math.floor(Math.random() * 1000000000)}`,
      appointmentDate: randomDate,
      reason: `${randomReason} for ${randomPet.breed}`,
      branch: randomBranch,
      status: status,
      petType: randomPet.type,
      breed: randomPet.breed
    });
  }

  return appointments;
};

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI; // Changed from MONGODB_URI to MONGO_URI
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB Atlas');

    // Clear existing appointments
    await Appointment.deleteMany({});
    console.log('Cleared existing appointments');

    // Generate and insert new appointments
    const appointments = generateRandomAppointments(200);
    const result = await Appointment.insertMany(appointments);
    console.log(`Successfully seeded ${result.length} appointments`);

    // Log statistics with more details
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$branch',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          }
        }
      }
    ]);

    console.log('\nAppointments Statistics:');
    console.table(stats.map(s => ({ 
      Branch: s._id, 
      Total: s.count,
      Completed: s.completed,
      Pending: s.pending
    })));

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Closed MongoDB connection');
    }
  }
};

// Properly handle script termination
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('Closed MongoDB connection due to script termination');
  }
  process.exit(0);
});

seedData();
