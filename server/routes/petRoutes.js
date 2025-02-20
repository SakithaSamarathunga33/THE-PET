const express = require("express");
const { addPet, getPets, getPetById, updatePet, deletePet } = require("../controllers/petController");

const router = express.Router();

router.post("/", addPet);        // Create pet
router.get("/", getPets);        // Read all pets
router.get("/:id", getPetById);  // Read single pet
router.put("/:id", updatePet);   // Update pet
router.delete("/:id", deletePet); // Delete pet

module.exports = router;
