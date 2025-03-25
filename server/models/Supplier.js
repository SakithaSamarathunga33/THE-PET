const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Supplier name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  contactPerson: { 
    type: String,
    trim: true,
    maxlength: [50, "Contact person name cannot exceed 50 characters"]
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Please provide a valid email address or leave empty"]
  },
  phone: { 
    type: String,
    trim: true,
    match: [/^(?:\+\d{1,3})?\s?\d{9,15}$|^$/, "Please provide a valid phone number or leave empty"]
  },
  address: { 
    type: String,
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"]
  },
  notes: { 
    type: String,
    trim: true,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  },
  items: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Inventory" 
  }],
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);