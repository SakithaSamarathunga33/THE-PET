const Supplier = require("../models/Supplier");

// Add new supplier
exports.addSupplier = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Enhanced validation
    // 1. Validate supplier name
    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ 
        error: 'Supplier name is required and must be between 2 and 100 characters' 
      });
    }
    
    // 2. Validate email if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
    }
    
    // 3. Validate phone number if provided
    if (phone && phone.trim() !== '') {
      const phoneRegex = /^(?:\+\d{1,3})?\s?\d{9,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Please provide a valid phone number' });
      }
    }
    
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ message: "Supplier added successfully", supplier });
  } catch (error) {
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate("items");
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Enhanced validation for update
    // Only validate fields that are being updated
    if (name !== undefined && (name.trim().length < 2 || name.trim().length > 100)) {
      return res.status(400).json({ 
        error: 'Supplier name must be between 2 and 100 characters' 
      });
    }
    
    if (email !== undefined && email.trim() !== '') {
      const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
    }
    
    if (phone !== undefined && phone.trim() !== '') {
      const phoneRegex = /^(?:\+\d{1,3})?\s?\d{9,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Please provide a valid phone number' });
      }
    }
    
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true  // This ensures Mongoose schema validators run on update
    });
    
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    
    res.status(400).json({ error: error.message });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};