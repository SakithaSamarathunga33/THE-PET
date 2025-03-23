const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  description: { type: String },
  reorderPoint: { type: Number, default: 10 },
  location: { type: String },
  lastRestocked: { type: Date },
  restockHistory: [
    {
      date: { type: Date },
      quantity: { type: Number },
      previousQuantity: { type: Number },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);