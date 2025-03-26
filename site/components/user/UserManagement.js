import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiUserPlus, FiDownload, FiUsers, FiX, FiSearch, FiLink, FiUserCheck } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    userType: 'user'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Veterinarian',
    baseSalary: '',
    hourlyRate: '',
    workingHoursPerDay: 8,
    address: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching users');
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/employees', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching employees');
    }
  };

  // Add validation functions
  const validateUserForm = () => {
    // Username validation
    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation for new users
    if (!selectedUser && formData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form before submission
      if (!validateUserForm()) {
        return;
      }

      const url = selectedUser 
        ? `http://localhost:8080/api/auth/user/${selectedUser._id}`
        : 'http://localhost:8080/api/auth/register';
      
      const method = selectedUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          username: formData.username.trim(),
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save user');
      }
      
      fetchUsers();
      setShowModal(false);
      resetForm();
      setSuccess(selectedUser ? 'User updated successfully' : 'User added successfully');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Error saving user');
    }
  };

  // Add input validation handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear error when user types
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      name: user.name || '',
      email: user.email || '',
      userType: user.userType || 'user',
      password: '' // Clear password for security
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to delete user');
        fetchUsers();
        setSuccess('User deleted successfully');
      } catch (err) {
        console.error('Delete error:', err);
        setError('Error deleting user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      userType: 'user'
    });
    setSelectedUser(null);
  };

  const generateReport = () => {
    const report = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Username: user.username,
      'User Type': user.userType,
      'Created At': new Date(user.createdAt).toLocaleDateString()
    }));

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const Notification = ({ type, message, onClose }) => {
    const bgColor = type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700';
    
    return (
      <div className={`mb-6 ${bgColor} border-l-4 p-4 rounded shadow-sm relative`}>
        <div className="flex items-center">
          <div className="py-1">
            <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={type === 'error' 
                  ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M5 13l4 4L19 7"
                } 
              />
            </svg>
          </div>
          <div>{message}</div>
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const handleLinkEmployee = (user) => {
    setSelectedUser(user);
    setShowLinkModal(true);
  };

  const submitLinkEmployee = async () => {
    if (!selectedEmployee || !selectedUser) {
      setError('Please select an employee to link');
      return;
    }

    try {
      console.log('Linking user to employee:', {
        userId: selectedUser._id,
        employeeId: selectedEmployee
      });
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:8080/api/auth/link-employee', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          employeeId: selectedEmployee
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to link user to employee');
      
      setSuccess('User linked to employee successfully');
      setShowLinkModal(false);
      setSelectedEmployee('');
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Link employee error:', err);
      setError(err.message);
    }
  };

  const handleCreateEmployeeAndLink = async (userId, userData) => {
    try {
      setLoading(true);
      
      // First create the employee
      const employeeResponse = await fetch('http://localhost:8080/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...employeeFormData,
          name: userData.name,
          email: userData.email
        }),
      });

      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json();
        throw new Error(errorData.message || 'Failed to create employee');
      }

      const employeeData = await employeeResponse.json();
      
      // Then link the user to the employee
      const linkResponse = await fetch('http://localhost:8080/api/auth/link-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          employeeId: employeeData.employee._id
        }),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        throw new Error(errorData.message || 'Failed to link user to employee');
      }

      setSuccess('Employee created and linked to user successfully');
      setShowCreateEmployeeModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Create and link error:', err);
      setError(err.message || 'Error creating employee and linking');
    } finally {
      setLoading(false);
    }
  };

  const openCreateEmployeeModal = (user) => {
    setSelectedUser(user);
    setEmployeeFormData({
      ...employeeFormData,
      name: user.name,
      email: user.email
    });
    setShowCreateEmployeeModal(true);
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Stats Cards
  const adminCount = users.filter(user => user.userType === 'admin').length;
  const regularCount = users.filter(user => user.userType === 'user').length;
  const employeeCount = users.filter(user => user.userType === 'employee').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FiUsers className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Notifications */}
      {error && (
        <Notification 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
      {success && (
        <Notification 
          type="success" 
          message={success} 
          onClose={() => setSuccess(null)} 
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Admin Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{adminCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Regular Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{regularCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Employee Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{employeeCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
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
            <FiUserPlus className="w-5 h-5 mr-2" />
            <span>Add User</span>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.userType === 'admin' 
                        ? 'bg-orange-100 text-orange-800' 
                        : user.userType === 'employee'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-orange-500 hover:text-orange-600 transition-colors duration-200"
                        title="Edit User"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-gray-900 hover:text-gray-700 transition-colors duration-200"
                        title="Delete User"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                      {user.userType !== 'employee' && (
                        <>
                          <button
                            onClick={() => handleLinkEmployee(user)}
                            className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                            title="Link to Existing Employee"
                          >
                            <FiLink className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openCreateEmployeeModal(user)}
                            className="text-green-500 hover:text-green-600 transition-colors duration-200"
                            title="Create New Employee & Link"
                          >
                            <FiUserCheck className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Update colors */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    minLength="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username (min. 3 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    minLength="2"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name (min. 2 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                {!selectedUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      required={!selectedUser}
                      minLength="8"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create password (min. 8 characters)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Password must contain uppercase, lowercase, number, and special character
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
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
                    {selectedUser ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Link Employee Modal */}
      {showLinkModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link {selectedUser.name} to Employee
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500">
                  This will give the user employee access with the corresponding employee role.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitLinkEmployee}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    Link Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Employee and Link Modal */}
      {showCreateEmployeeModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Employee Profile for {selectedUser.name}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateEmployeeAndLink(selectedUser._id, selectedUser);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={employeeFormData.name}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={employeeFormData.phoneNumber}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, phoneNumber: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      placeholder="555-123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={employeeFormData.role}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, role: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="Veterinarian">Veterinarian</option>
                      <option value="Groomer">Groomer</option>
                      <option value="Store Assistant">Store Assistant</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                    <input
                      type="number"
                      value={employeeFormData.baseSalary}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, baseSalary: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                    <input
                      type="number"
                      value={employeeFormData.hourlyRate}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, hourlyRate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      placeholder="25"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={employeeFormData.address}
                      onChange={(e) => setEmployeeFormData({...employeeFormData, address: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                      placeholder="123 Pet Street, Petville, PC 12345"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will create an employee profile and automatically link it to this user account. 
                    The user will be able to log in with their existing credentials and will have employee access.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateEmployeeModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Employee & Link'}
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

export default UserManagement;
