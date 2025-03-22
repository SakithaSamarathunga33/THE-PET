const Pet = require("../models/Pet");

// Add new pet
exports.addPet = async (req, res) => {
    try {
        const pet = new Pet(req.body);
        await pet.save();
        res.status(201).json({ message: "Pet added successfully", pet });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};    

// Get all pets
exports.getPets = async (req, res) => {  
        const pets = await Pet.find();
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single pet by ID
exports.getPetById = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ message: "Pet not found" });
        res.status(200).json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }    
};

// Update pet
exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pet) return res.status(404).json({ message: "Pet not found" });
        res.status(200).json({ message: "Pet updated successfully", pet });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }  
};  

// Delete pet
exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if (!pet) return res.status(404).json({ message: "Pet not found" });
        res.status(200).json({ message: "Pet deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }    
};
