const express = require("express");
const { 
    addPet, 
    getPets, 
    getPetById, 
    updatePet, 
    deletePet, 
    getPetsByType,
    addSamplePets,
    clearAllPets
} = require("../controllers/petController");

const router = express.Router();

router.post("/", addPet);                 // Create pet
router.get("/", getPets);                 // Read all pets with filtering
router.get("/type/:type", getPetsByType); // Get pets by type
router.get("/samples", addSamplePets);    // Information about default images
router.delete("/clear", clearAllPets);    // Clear all pets
router.get("/:id", getPetById);           // Read single pet
router.put("/:id", updatePet);            // Update pet
router.delete("/:id", deletePet);         // Delete pet

module.exports = router;
