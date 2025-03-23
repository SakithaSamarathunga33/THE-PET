import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiSearch, FiImage } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';

const PetManagement = ({ onDataChange }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    type: 'Dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'Male',
    price: '',
    status: 'Available',
    description: '',
    medicalHistory: ''
    // imageUrl is intentionally omitted to use default images based on type
  });
  
  // Store default images for each pet type
  const [defaultImages, setDefaultImages] = useState({
    Dog: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3',
    Cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3',
    Bird: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?ixlib=rb-4.0.3',
    Fish: 'https://images.unsplash.com/photo-1520302519878-3fba5b003eed?ixlib=rb-4.0.3',
    Rabbit: 'https://images.unsplash.com/photo-1535241749838-299277b6305f?ixlib=rb-4.0.3'
  });
  
  // Track if user has manually set an image
  const [useCustomImage, setUseCustomImage] = useState(false);

  useEffect(() => {
    fetchPets();
    fetchDefaultImages();
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
  
  // When type changes, update the image URL if not using custom image
  useEffect(() => {
    if (!useCustomImage && formData.type) {
      setFormData(prev => ({
        ...prev,
        imageUrl: defaultImages[formData.type] || ''
      }));
    }
  }, [formData.type, useCustomImage, defaultImages]);

  const fetchDefaultImages = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/pets/samples', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.defaultImages) {
          setDefaultImages(data.defaultImages);
        }
      }
    } catch (err) {
      console.error('Error fetching default images:', err);
    }
  };

  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/pets', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch pets');
      const data = await response.json();
      setPets(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching pets');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedPet
        ? `http://localhost:8080/api/pets/${selectedPet._id}`
        : 'http://localhost:8080/api/pets';
      
      const method = selectedPet ? 'PUT' : 'POST';
      
      // If not using custom image, remove imageUrl to let server assign default
      const submitData = { ...formData };
      if (!useCustomImage) {
        delete submitData.imageUrl;
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save pet');
      
      setSuccess(data.message);
      setShowModal(false);
      resetForm();
      await fetchPets();
      
      // Notify parent component of data change
      if (onDataChange) onDataChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/pets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      await fetchPets();
      
      // Notify parent component of data change
      if (onDataChange) onDataChange();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (pet) => {
    setSelectedPet(pet);
    
    // Check if pet has a custom image (not one of the default images)
    const isCustomImage = pet.imageUrl && !Object.values(defaultImages).includes(pet.imageUrl);
    setUseCustomImage(isCustomImage);
    
    setFormData({
      type: pet.type || 'Dog',
      breed: pet.breed || '',
      age: pet.age || '',
      weight: pet.weight || '',
      gender: pet.gender || 'Male',
      price: pet.price || '',
      status: pet.status || 'Available',
      imageUrl: pet.imageUrl || defaultImages[pet.type] || '',
      description: pet.description || '',
      medicalHistory: pet.medicalHistory || ''
    });
    
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'Dog',
      breed: '',
      age: '',
      weight: '',
      gender: 'Male',
      price: '',
      status: 'Available',
      description: '',
      medicalHistory: ''
      // imageUrl is intentionally omitted to use defaults
    });
    setUseCustomImage(false);
    setSelectedPet(null);
  };
  
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setUseCustomImage(!!url); // If URL is provided, use custom image
    setFormData({...formData, imageUrl: url});
  };
  
  const toggleUseCustomImage = () => {
    if (useCustomImage) {
      // Switch back to default image
      setUseCustomImage(false);
      setFormData(prev => ({
        ...prev,
        imageUrl: defaultImages[prev.type] || ''
      }));
    } else {
      // Enable custom image input
      setUseCustomImage(true);
    }
  };

  const generateReport = () => {
    const report = pets.map(pet => ({
      'Pet Type': pet.type,
      'Breed': pet.breed,
      'Age': pet.age,
      'Weight': `${pet.weight} kg`,
      'Gender': pet.gender,
      'Price': `Rs. ${pet.price}`,
      'Status': pet.status,
      'Medical History': pet.medicalHistory || 'None'
    }));

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pets-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter pets based on search term
  const filteredPets = pets.filter(pet => {
    if (!pet) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (pet.type?.toLowerCase() || '').includes(searchLower) ||
      (pet.breed?.toLowerCase() || '').includes(searchLower) ||
      (pet.status?.toLowerCase() || '').includes(searchLower) ||
      (pet.description?.toLowerCase() || '').includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search pets..."
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
            <MdPets className="w-5 h-5 mr-2" />
            <span>Add Pet</span>
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

      {/* Pets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Breed</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price (Rs.)</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPets.map((pet) => (
                <tr key={pet._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{pet.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.breed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{pet.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Rs. {pet.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pet.status === 'Available' ? 'bg-green-100 text-green-800' : 
                      pet.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {pet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(pet)}
                        className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pet._id)}
                        className="text-gray-900 hover:text-gray-700 transition-colors duration-200"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border max-w-xl w-full shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedPet ? 'Edit Pet' : 'Add New Pet'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Fish">Fish</option>
                      <option value="Rabbit">Rabbit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Breed</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-gray-700">Image URL</label>
                      <button 
                        type="button" 
                        onClick={toggleUseCustomImage}
                        className="text-xs text-orange-500 hover:text-orange-700"
                      >
                        {useCustomImage ? "Use Default Image" : "Use Custom Image"}
                      </button>
                    </div>
                    {useCustomImage ? (
                      <input
                        type="text"
                        value={formData.imageUrl || ''}
                        onChange={handleImageUrlChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    ) : (
                      <div className="mt-1 flex items-center p-2 border border-gray-300 rounded-md bg-gray-50">
                        <FiImage className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Using default image for {formData.type}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    rows="2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical History</label>
                  <textarea
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    rows="2"
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
                    {selectedPet ? 'Update' : 'Add'}
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

export default PetManagement;
