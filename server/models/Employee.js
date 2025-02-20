const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true 
    },
    phoneNumber: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['Veterinarian', 'Groomer', 'Store Assistant', 'Receptionist', 'Manager'],
        required: true 
    },
    salary: { 
        type: Number, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema); 