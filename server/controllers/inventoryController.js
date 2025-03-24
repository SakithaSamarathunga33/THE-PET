const Inventory = require("../models/Inventory");
const Supplier = require("../models/Supplier");

// Add new inventory item
exports.addItem = async (req, res) => {
  try {
    const { itemName, category, quantity, price, supplier } = req.body;
    
    // Enhanced validation
    // 1. Validate item name
    if (!itemName || itemName.trim().length < 2 || itemName.trim().length > 100) {
      return res.status(400).json({ 
        error: 'Item name is required and must be between 2 and 100 characters' 
      });
    }
    
    // 2. Validate category
    if (!category || category.trim().length < 2 || category.trim().length > 50) {
      return res.status(400).json({ 
        error: 'Category is required and must be between 2 and 50 characters' 
      });
    }
    
    // 3. Validate quantity
    if (quantity === undefined || quantity === null || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({ 
        error: 'Quantity is required and must be a non-negative integer' 
      });
    }
    
    // 4. Validate price
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ 
        error: 'Price is required and must be a non-negative number' 
      });
    }
    
    // 5. Validate supplier if provided
    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(400).json({ error: 'Selected supplier does not exist' });
      }
    }
    
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ message: "Item added successfully", item });
  } catch (error) {
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    
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

// Update an inventory item
exports.updateItem = async (req, res) => {
  try {
    const { itemName, category, quantity, price, supplier } = req.body;
    
    // Enhanced validation for update
    // Only validate fields that are being updated
    if (itemName !== undefined && (itemName.trim().length < 2 || itemName.trim().length > 100)) {
      return res.status(400).json({ 
        error: 'Item name must be between 2 and 100 characters' 
      });
    }
    
    if (category !== undefined && (category.trim().length < 2 || category.trim().length > 50)) {
      return res.status(400).json({ 
        error: 'Category must be between 2 and 50 characters' 
      });
    }
    
    if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
      return res.status(400).json({ 
        error: 'Quantity must be a non-negative integer' 
      });
    }
    
    if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
      return res.status(400).json({ 
        error: 'Price must be a non-negative number' 
      });
    }
    
    // Validate supplier if provided
    if (supplier) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(400).json({ error: 'Selected supplier does not exist' });
      }
    }
    
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true // This ensures Mongoose schema validators run on update 
    });
    
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    
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

    // Enhanced validation for restock operation
    if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ 
        error: "Restock quantity is required and must be a positive integer" 
      });
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
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    
    res.status(400).json({ error: error.message });
  }
};