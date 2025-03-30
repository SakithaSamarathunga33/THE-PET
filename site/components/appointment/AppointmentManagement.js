import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiSearch, FiCalendar } from 'react-icons/fi';
import BranchAnalytics from '../dashboard/BranchAnalytics';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    contactNumber: '',
    appointmentDate: '',
    reason: '',
    branch: '',
    status: 'Pending'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [highlightedAppointmentId, setHighlightedAppointmentId] = useState(null);

  useEffect(() => {
    fetchAppointments();
    
    // Check if user is admin
    const checkAdmin = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(decodedToken.userType === 'admin');
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };
    
    checkAdmin();
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

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/appointments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication expired. Please log in again.');
          // Redirect to login or show login form
          return;
        }
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      
      // Make absolutely sure appointments are sorted by createdAt date in descending order (newest first)
      const sortedAppointments = [...data].sort((a, b) => {
        // Handle missing createdAt by putting items without timestamp at the bottom
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      console.log('Appointments sorted by date, newest first:', 
        sortedAppointments.map(apt => ({
          id: apt._id,
          date: new Date(apt.createdAt).toLocaleString(),
        }))
      );
      
      setAppointments(sortedAppointments);
      setLoading(false);
    } catch (err) {
      setError('Error fetching appointments: ' + err.message);
      setLoading(false);
    }
  };

  // Add validation functions
  const validateAppointmentForm = () => {
    // Pet name validation
    if (formData.petName.trim().length < 2) {
      setError('Pet name must be at least 2 characters long');
      return false;
    }

    // Contact number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.contactNumber.trim())) {
      setError('Please enter a valid contact number (minimum 10 digits)');
      return false;
    }

    // Date validation
    const appointmentDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      setError('Appointment date cannot be in the past');
      return false;
    }

    // Reason validation
    if (formData.reason.trim().length < 10) {
      setError('Please provide a detailed reason for the appointment (minimum 10 characters)');
      return false;
    }

    return true;
  };

  // Add function to notify parent of changes
  const notifyAnalyticsUpdate = () => {
    const event = new CustomEvent('appointmentUpdated', {
      detail: { timestamp: new Date().getTime() }
    });
    window.dispatchEvent(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Validate form before submission
      if (!validateAppointmentForm()) {
        return;
      }

      const url = selectedAppointment
        ? `http://localhost:8080/api/appointments/${selectedAppointment._id}`
        : 'http://localhost:8080/api/appointments';
      
      const method = selectedAppointment ? 'PUT' : 'POST';

      // Prepare form data without ownerName if not admin (server will use logged-in user name)
      const requestData = { ...formData };
      if (!isAdmin && !selectedAppointment) {
        delete requestData.ownerName; // Remove ownerName from request data
      }
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...requestData,
          petName: requestData.petName.trim(),
          contactNumber: requestData.contactNumber.trim(),
          reason: requestData.reason.trim()
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to save appointment');
      
      // Set the newly added appointment ID to highlight it
      const newAppointmentId = data.appointment?._id;
      setHighlightedAppointmentId(newAppointmentId);
      
      // Clear the highlight after 5 seconds
      setTimeout(() => {
        setHighlightedAppointmentId(null);
      }, 5000);
      
      setSuccess(data.message);
      setShowModal(false);
      resetForm();
      
      // Immediately fetch appointments to show the new one at the top
      await fetchAppointments();
      
      notifyAnalyticsUpdate(); // Notify that appointments changed
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message);
      
      setSuccess(data.message);
      await fetchAppointments();
      notifyAnalyticsUpdate(); // Notify that appointments changed
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      petName: appointment.petName || '',
      ownerName: appointment.ownerName || '',
      contactNumber: appointment.contactNumber || '',
      appointmentDate: new Date(appointment.appointmentDate).toISOString().split('T')[0],
      reason: appointment.reason || '',
      branch: appointment.branch || '',
      status: appointment.status || 'Pending'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      ownerName: '',
      contactNumber: '',
      appointmentDate: '',
      reason: '',
      branch: '',
      status: 'Pending'
    });
    setSelectedAppointment(null);
  };

  const generateReport = () => {
    const report = appointments.map(apt => ({
      'Pet Name': apt.petName,
      'Owner Name': apt.ownerName,
      'Contact': apt.contactNumber,
      'Branch': apt.branch,
      'Date': new Date(apt.appointmentDate).toLocaleDateString(),
      'Reason': apt.reason,
      'Status': apt.status
    }));

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add input validation handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear error when user types
  };

  return (
    <div className="space-y-6 relative">
      {/* Notifications */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search appointments..."
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
            <span>Add Appointment</span>
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

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pet Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr 
                  key={appointment._id} 
                  className={`hover:bg-gray-50 transition-colors duration-300 ${
                    appointment._id === highlightedAppointmentId 
                      ? 'bg-green-50 animate-pulse' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.petName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.ownerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.contactNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
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

      {/* Add/Edit Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAppointment ? 'Edit Appointment' : 'Add New Appointment'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pet Name</label>
                  <input
                    type="text"
                    name="petName"
                    required
                    minLength="2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.petName}
                    onChange={handleInputChange}
                    placeholder="Enter pet name (min. 2 characters)"
                  />
                </div>
                {/* Only show owner name field for admin users who may need to override */}
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      minLength="2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Enter owner name (min. 2 characters)"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    pattern="[0-9]+"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({...formData, contactNumber: value});
                    }}
                    placeholder="Enter contact number (numbers only)"
                    minLength="10"
                    maxLength="15"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter numbers only, no spaces or special characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    name="reason"
                    required
                    minLength="10"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    rows="3"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Enter reason for appointment (min. 10 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <select
                    name="branch"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.branch}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a branch</option>
                    <option value="Colombo Branch">Colombo Branch</option>
                    <option value="Kandy Branch">Kandy Branch</option>
                    <option value="Galle Branch">Galle Branch</option>
                    <option value="Jaffna Branch">Jaffna Branch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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
                    {selectedAppointment ? 'Update' : 'Add'}
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

export default AppointmentManagement;
