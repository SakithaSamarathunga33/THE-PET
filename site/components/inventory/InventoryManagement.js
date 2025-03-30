import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiPackage, FiSearch, FiBox, FiAlertTriangle } from "react-icons/fi";

const InventoryManagement = () => {
  // State declarations
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [restockQuantity, setRestockQuantity] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    quantity: "",
    price: "",
    supplier: "",
    description: "",
    reorderPoint: "10",
    location: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Calculate summary metrics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint).length;

  // Fetch data on component mount
  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch inventory from API
  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/inventory", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setInventory(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching inventory");
      setLoading(false);
    }
  };

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/suppliers", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching suppliers");
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!formData.itemName.trim()) {
      errors.itemName = "Item name is required";
    } else if (formData.itemName.length < 2) {
      errors.itemName = "Item name must be at least 2 characters";
    }
    
    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }
    
    if (!formData.quantity) {
      errors.quantity = "Quantity is required";
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      errors.quantity = "Quantity must be a non-negative number";
    }
    
    if (!formData.price) {
      errors.price = "Price is required";
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue)) {
        errors.price = "Price must be a number";
      } else if (priceValue <= 0) {
        errors.price = "Price must be a positive number";
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
        errors.price = "Price can have up to 2 decimal places";
      }
    }
    
  if (formData.reorderPoint && (isNaN(formData.reorderPoint) || parseInt(formData.reorderPoint) < 0)) {
    errors.reorderPoint = "Reorder point must be a non-negative number";
  }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate restock quantity
  const validateRestockQuantity = () => {
    if (!restockQuantity) {
      setError("Quantity is required");
      return false;
    }
    
    if (isNaN(restockQuantity) || parseInt(restockQuantity) <= 0) {
      setError("Quantity must be a positive number");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const url = selectedItem
        ? `http://localhost:8080/api/inventory/${selectedItem._id}`
        : "http://localhost:8080/api/inventory";

      const method = selectedItem ? "PUT" : "POST";

      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price)
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save item");

      setSuccess(data.message);
      setShowModal(false);
      resetForm();
      fetchInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle item deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/inventory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess(data.message);
      fetchInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName || "",
      category: item.category || "",
      quantity: item.quantity || "",
      price: item.price ? item.price.toString() : "",
      supplier: item.supplier?._id || "",
      description: item.description || "",
      reorderPoint: item.reorderPoint || "10",
      location: item.location || "",
    });
    setShowModal(true);
  };

  // Open restock modal
  const openRestockModal = (item) => {
    setSelectedItem(item);
    setRestockQuantity("");
    setShowRestockModal(true);
  };

  // Handle restock form submission
  const handleRestock = async (e) => {
    e.preventDefault();
    
    if (!validateRestockQuantity()) return;

    try {
      const response = await fetch(`http://localhost:8080/api/inventory/${selectedItem._id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: parseInt(restockQuantity) }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to restock item");

      setSuccess(data.message);
      setShowRestockModal(false);
      fetchInventory();
    } catch (err) {
      setError(err.message);
    }
  };

  // Generate CSV report
  const generateReport = () => {
    if (inventory.length === 0) {
      setError("No inventory data to generate a report.");
      return;
    }

    const report = inventory.map((item) => ({
      "Item Name": item.itemName,
      Category: item.category,
      Quantity: item.quantity,
      Price: `LKR ${item.price}`,
      Supplier: item.supplier?.name || "N/A",
      Location: item.location || "N/A",
      "Reorder Point": item.reorderPoint,
      Status: item.quantity <= item.reorderPoint ? "Low Stock" : "In Stock"
    }));

    const csv = [
      Object.keys(report[0]).join(","),
      ...report.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "",
      quantity: "",
      price: "",
      supplier: "",
      description: "",
      reorderPoint: "10",
      location: "",
    });
    setSelectedItem(null);
    setValidationErrors({});
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter((item) => {
    if (!item) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.itemName?.toLowerCase() || "").includes(searchLower) ||
      (item.category?.toLowerCase() || "").includes(searchLower) ||
      (item.supplier?.name?.toLowerCase() || "").includes(searchLower) ||
      (item.location?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Format price with LKR currency
  const formatPrice = (price) => {
    return `LKR ${parseFloat(price).toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notifications */}
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded relative">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Inventory Items Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiBox className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-500">Total Inventory Items</h3>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${lowStockItems > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} mr-4`}>
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-500">Low Stock Items</h3>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              {lowStockItems > 0 && (
                <p className="text-sm text-red-500 mt-1">Items below reorder point</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header with search and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowModal(true); resetForm(); }}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            <span>Add Item</span>
          </button>
          <button
            onClick={generateReport}
            className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 shadow-sm"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price (LKR)</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.quantity <= item.reorderPoint ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                    >
                      {item.quantity}
                    </span>
                    {item.quantity <= item.reorderPoint && (
                      <span className="ml-2 text-xs text-red-500">
                        Low stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(item.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier?.name || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
                        title="Edit item"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-gray-900 hover:text-gray-700 transition-colors duration-200"
                        title="Delete item"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openRestockModal(item)}
                        className={`${
                          item.quantity <= item.reorderPoint 
                            ? "text-green-500 hover:text-green-600" 
                            : "text-blue-500 hover:text-blue-600"
                        } transition-colors duration-200`}
                        title="Restock item"
                      >
                        <FiPackage className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedItem ? "Edit Item" : "Add New Item"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.itemName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.itemName && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.itemName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.category && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.category}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                        validationErrors.quantity ? "border-red-500" : "border-gray-300"
                      }`}
                      min="0"
                    />
                    {validationErrors.quantity && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.quantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (LKR)</label>
                    <div className={`mt-1 flex rounded-md shadow-sm ${
                      validationErrors.price ? "border border-red-500" : ""
                    }`}>
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        LKR
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-orange-500 focus:border-orange-500 ${
                          validationErrors.price ? "border-red-500" : "border-gray-300"
                        }`}
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                    {validationErrors.price && (
                      <p className="mt-1 text-xs text-red-500">{validationErrors.price}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reorder Point</label>
                  <input
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.reorderPoint ? "border-red-500" : "border-gray-300"
                    }`}
                    min="0"
                  />
                  {validationErrors.reorderPoint && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.reorderPoint}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    {selectedItem ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Restock Item: {selectedItem.itemName}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Current quantity: <span className="font-medium">{selectedItem.quantity}</span></p>
                <p className="text-sm text-gray-500">Reorder point: <span className="font-medium">{selectedItem.reorderPoint}</span></p>
                {selectedItem.supplier && (
                  <p className="text-sm text-gray-500 mt-1">
                    Supplier: <span className="font-medium">{selectedItem.supplier.name}</span>
                  </p>
                )}
              </div>
              <form onSubmit={handleRestock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity to Add</label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                    min="1"
                    placeholder="Enter quantity to add"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    New total: {selectedItem.quantity + (parseInt(restockQuantity) || 0)}
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRestockModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Restock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;