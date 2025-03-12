const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    petName: {
      type: String,
      required: true
    },
    ownerName: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      required: true,
      enum: ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch']
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
