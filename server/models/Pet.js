const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    type: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    owner: { type: String},
    medicalHistory: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Pet", petSchema);
