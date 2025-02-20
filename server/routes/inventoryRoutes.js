const express = require("express");
const { addItem, getItems, getItemById, updateItem, deleteItem } = require("../controllers/inventoryController");

const router = express.Router();

router.post("/", addItem);         // Create inventory item
router.get("/", getItems);         // Read all items
router.get("/:id", getItemById);   // Read single item
router.put("/:id", updateItem);    // Update item
router.delete("/:id", deleteItem); // Delete item

module.exports = router; 