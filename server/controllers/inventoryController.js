const Inventory = require("../models/Inventory");
const Supplier = require("../models/Supplier");

// Add new inventory item
exports.addItem = async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ message: "Item added successfully", item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all inventory items
exports.getItems = async (req, res) => {
  try {
    const items = await Inventory.find().populate("supplier");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single inventory item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate("supplier");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete inventory item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restock inventory item
exports.restockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Valid quantity required for restock" });
    }

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const previousQuantity = item.quantity;
    item.quantity += parseInt(quantity);
    item.lastRestocked = new Date();

    // Add to restock history
    item.restockHistory.push({
      date: new Date(),
      quantity: parseInt(quantity),
      previousQuantity,
    });

    await item.save();

    res.status(200).json({
      message: "Item restocked successfully",
      item,
      restockDetails: {
        previousQuantity,
        addedQuantity: parseInt(quantity),
        newQuantity: item.quantity,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};