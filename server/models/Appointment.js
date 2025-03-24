const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    petType: {
      type: String,
      required: [true, "Pet type is required"],
      enum: {
        values: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'],
        message: "{VALUE} is not a valid pet type"
      }
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
      minlength: [2, "Owner name must be at least 2 characters long"],
      maxlength: [50, "Owner name cannot exceed 50 characters"]
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^(?:\+\d{1,3})?\s?\d{9,15}$/, "Please provide a valid contact number"]
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
      validate: {
        validator: function(value) {
          // Allow appointments from today onwards
          return value >= new Date(new Date().setHours(0, 0, 0, 0));
        },
        message: "Appointment date cannot be in the past"
      }
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      minlength: [5, "Reason must be at least 5 characters long"],
      maxlength: [500, "Reason cannot exceed 500 characters"]
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      enum: {
        values: ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'],
        message: "{VALUE} is not a valid branch"
      }
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Confirmed", "Completed", "Cancelled"],
        message: "{VALUE} is not a valid status"
      },
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
