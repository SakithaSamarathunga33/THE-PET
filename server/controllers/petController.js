const Pet = require("../models/Pet");

// Add new pet
exports.addPet = async (req, res) => {
    try {
        const petData = { ...req.body };
        
        // If no image URL is provided, use the default image for the pet type
        if (!petData.imageUrl && petData.type) {
            petData.imageUrl = Pet.getDefaultImageForType(petData.type);
        }
        
        const pet = new Pet(petData);
        await pet.save();
        res.status(201).json({ message: "Pet added successfully", pet });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all pets with filtering and sorting options
exports.getPets = async (req, res) => {
    try {
        const { type, gender, minPrice, maxPrice, sort } = req.query;
        
        // Build filter object
        const filter = {};
        
        // Add type filter if specified
        if (type) {
            filter.type = type;
        }
        
        // Add gender filter if specified
        if (gender) {
            filter.gender = gender;
        }
        
        // Add price range filter if specified
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        // Build sort options
        let sortOptions = {};
        if (sort === 'priceLow') {
            sortOptions = { price: 1 }; // Ascending
        } else if (sort === 'priceHigh') {
            sortOptions = { price: -1 }; // Descending
        } else {
            // Default sort by most recent
            sortOptions = { createdAt: -1 };
        }
        
        // Find pets with filters and sort
        const pets = await Pet.find(filter).sort(sortOptions);
        
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get pets by type
exports.getPetsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const pets = await Pet.find({ type });
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
        const petData = { ...req.body };
        
        // If type is being changed and no new image URL is provided, use default image for the new type
        if (petData.type && !petData.imageUrl) {
            const currentPet = await Pet.findById(req.params.id);
            if (currentPet && currentPet.type !== petData.type) {
                petData.imageUrl = Pet.getDefaultImageForType(petData.type);
            }
        }
        
        const pet = await Pet.findByIdAndUpdate(req.params.id, petData, { new: true });
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

// Clear all pets from database
exports.clearAllPets = async (req, res) => {
    try {
        await Pet.deleteMany({});
        res.status(200).json({ message: "All pets have been removed from the database" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add sample pets (now just returns a message - sample data removed as requested)
exports.addSamplePets = async (req, res) => {
    try {
        // Check if we need to clear existing pets
        if (req.query.clear === 'true') {
            await Pet.deleteMany({});
        }
        
        // Return message without adding any sample pets
        res.status(200).json({
            message: "Sample pet data has been removed from the controller. Please add pets manually through the admin interface.",
            defaultImages: {
                Dog: Pet.getDefaultImageForType('Dog'),
                Cat: Pet.getDefaultImageForType('Cat'),
                Bird: Pet.getDefaultImageForType('Bird'),
                Fish: Pet.getDefaultImageForType('Fish'),
                Rabbit: Pet.getDefaultImageForType('Rabbit')
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
