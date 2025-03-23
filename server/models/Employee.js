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
    baseSalary: { 
        type: Number, 
        required: true 
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    workingHoursPerDay: {
        type: Number,
        default: 8
    },
    address: { 
        type: String, 
        required: true 
    },
    joiningDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Terminated'],
        default: 'Active'
    },
    leaves: [{
        type: {
            type: String,
            enum: ['Sick', 'Vacation', 'Personal', 'Unpaid'],
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        approved: {
            type: Boolean,
            default: false
        },
        paid: {
            type: Boolean,
            default: function() {
                // Default to paid for Vacation and Sick, unpaid for other types
                return this.type === 'Vacation' || this.type === 'Sick';
            }
        },
        reason: {
            type: String,
            default: ''
        },
        comment: {
            type: String,
            default: ''
        }
    }],
    overtime: [{
        date: {
            type: Date,
            required: true
        },
        hours: {
            type: Number,
            required: true
        },
        approved: {
            type: Boolean,
            default: false
        },
        rate: {
            type: Number,
            default: 1.5 // 1.5x normal hourly rate
        }
    }],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        present: {
            type: Boolean,
            required: true
        },
        checkIn: Date,
        checkOut: Date,
        hoursWorked: Number
    }],
    calculatedSalary: {
        type: Number,
        default: function() {
            return this.baseSalary;
        }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for calculating monthly salary
employeeSchema.virtual('monthlySalary').get(function() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Calculate base salary per day
    const daysInMonth = endOfMonth.getDate();
    const dailyRate = this.baseSalary / daysInMonth;

    // Calculate leave deductions
    const leaveDeductions = this.leaves
        .filter(leave => 
            !leave.paid && 
            leave.approved && 
            leave.startDate >= startOfMonth && 
            leave.endDate <= endOfMonth
        )
        .reduce((total, leave) => {
            const days = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24));
            return total + (dailyRate * days);
        }, 0);

    // Calculate overtime pay
    const overtimePay = this.overtime
        .filter(ot => 
            ot.approved && 
            ot.date >= startOfMonth && 
            ot.date <= endOfMonth
        )
        .reduce((total, ot) => {
            return total + (this.hourlyRate * ot.hours * ot.rate);
        }, 0);

    return this.baseSalary - leaveDeductions + overtimePay;
});

module.exports = mongoose.model("Employee", employeeSchema);