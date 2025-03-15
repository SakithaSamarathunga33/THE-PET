const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Employee = require('../server/models/Employee');
const User = require('../server/models/user');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample employee data
const sampleEmployee = {
  name: 'John Smith',
  email: 'john.smith@petcare.com',
  phoneNumber: '555-123-4567',
  role: 'Veterinarian',
  baseSalary: 5000,
  hourlyRate: 25,
  workingHoursPerDay: 8,
  address: '123 Pet Street, Petville, PC 12345',
  status: 'Active',
  joiningDate: new Date('2023-01-15'),
  attendance: [
    {
      date: new Date('2023-05-01'),
      present: true,
      checkIn: new Date('2023-05-01T09:00:00'),
      checkOut: new Date('2023-05-01T17:00:00'),
      hoursWorked: 8
    },
    {
      date: new Date('2023-05-02'),
      present: true,
      checkIn: new Date('2023-05-02T08:45:00'),
      checkOut: new Date('2023-05-02T17:15:00'),
      hoursWorked: 8.5
    },
    {
      date: new Date('2023-05-03'),
      present: false
    }
  ],
  leaves: [
    {
      type: 'Vacation',
      startDate: new Date('2023-06-10'),
      endDate: new Date('2023-06-15'),
      approved: true,
      paid: true
    }
  ],
  overtime: [
    {
      date: new Date('2023-05-15'),
      hours: 3,
      approved: true,
      rate: 1.5
    }
  ]
};

// Sample user data
const sampleUser = {
  username: 'employee',
  name: 'John Smith',
  email: 'john.smith@petcare.com',
  password: 'Password123!',
  userType: 'user' // Will be changed to 'employee' after linking
};

// Create employee and user
async function createSampleData() {
  try {
    // Check if employee already exists
    let employee = await Employee.findOne({ email: sampleEmployee.email });
    
    if (employee) {
      console.log('Sample employee already exists with ID:', employee._id);
    } else {
      // Create new employee
      employee = new Employee(sampleEmployee);
      await employee.save();
      console.log('Sample employee created with ID:', employee._id);
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: sampleUser.email },
        { username: sampleUser.username }
      ]
    });

    if (user) {
      console.log('Sample user already exists');
      
      // Update user to link with employee and ensure password is correct
      user.userType = 'employee';
      user.employeeId = employee._id;
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sampleUser.password, salt);
      user.password = hashedPassword;
      
      await user.save();
      console.log('Existing user updated and linked to employee');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sampleUser.password, salt);

      // Create new user
      user = new User({
        ...sampleUser,
        password: hashedPassword,
        userType: 'employee',
        employeeId: employee._id
      });

      await user.save();
      console.log('Sample user created:', user.username);
    }

    return { employee, user };
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

// Run the function and close connection
createSampleData()
  .then(result => {
    console.log('Sample data created successfully');
    console.log('----------------------------------------');
    console.log('Login Credentials:');
    console.log('Username:', sampleUser.username);
    console.log('Password:', sampleUser.password);
    console.log('User Type: employee');
    console.log('----------------------------------------');
    
    // Close MongoDB connection
    setTimeout(() => {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }, 1000);
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.connection.close();
  }); 