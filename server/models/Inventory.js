const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: [true, "Item name is required"],
    trim: true,
    minlength: [2, "Item name must be at least 2 characters long"],
    maxlength: [100, "Item name cannot exceed 100 characters"]
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    trim: true,
    minlength: [2, "Category must be at least 2 characters long"],
    maxlength: [50, "Category cannot exceed 50 characters"]
  },
  quantity: { 
    type: Number, 
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for quantity'
    }
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Supplier",
    validate: {
      validator: async function(value) {
        // Only validate if a supplier is provided
        if (!value) return true;
        const Supplier = mongoose.model('Supplier');
        const supplierExists = await Supplier.findById(value);
        return supplierExists ? true : false;
      },
      message: 'Selected supplier does not exist'
    }
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  reorderPoint: { 
    type: Number, 
    default: 10,
    min: [0, "Reorder point cannot be negative"],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value for reorder point'
    }
  },
  location: { 
    type: String,
    trim: true,
    maxlength: [100, "Location cannot exceed 100 characters"]
  },
  lastRestocked: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value <= new Date();
      },
      message: 'Restock date cannot be in the future'
    }
  },
  restockHistory: [
    {
      date: { 
        type: Date,
        required: [true, "Restock date is required"],
        validate: {
          validator: function(value) {
            return value <= new Date();
          },
          message: 'Restock date cannot be in the future'
        }
      },
      quantity: { 
        type: Number,
        required: [true, "Restock quantity is required"],
        min: [1, "Restock quantity must be at least 1"],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value for restock quantity'
        }
      },
      previousQuantity: { 
        type: Number,
        required: [true, "Previous quantity is required"],
        min: [0, "Previous quantity cannot be negative"],
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value for previous quantity'
        }
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);