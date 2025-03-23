const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  notes: { type: String },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }],
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);