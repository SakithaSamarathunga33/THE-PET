const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    supplier: { type: String },
    description: { type: String },
    reorderPoint: { type: Number, default: 10 }, // Minimum quantity before reorder
    location: { type: String }, // Storage location
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema); 