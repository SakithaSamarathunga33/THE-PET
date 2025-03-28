import React, { useState, useEffect } from "react";
import { FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiRefreshCcw, FiLink, FiCheck, FiX, FiCalendar, FiUser } from 'react-icons/fi';

const EmployeeManagement = ({ onDataChange }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
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
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    baseSalary: '',
    hourlyRate: '',
    address: ''
  });
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedSalaryDetails, setSelectedSalaryDetails] = useState(null);
  const [manualCalculation, setManualCalculation] = useState(false);
  const [calculationInputs, setCalculationInputs] = useState({
    overtimeHours: 0,
    overtimeRate: 1.5,
    unpaidLeaveDays: 0,
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [linkedUsers, setLinkedUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLeaveDetailModal, setShowLeaveDetailModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveStatusForm, setLeaveStatusForm] = useState({
    paid: true,
    comment: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchUsers();
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

  const fetchEmployees = async () => {
    try {
      console.log("Fetching employees data...");
      const response = await fetch('http://localhost:8080/api/employees', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      console.log("Fetched employees data:", data);
      
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError('Error fetching employees');
      setLoading(false);
    }
  };

  // Fetch users for linking and check which employees are already linked
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/user', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      // Filter out users that are already employees
      const filteredUsers = data.filter(user => user.userType !== 'employee');
      setUsers(filteredUsers);
      
      // Create a mapping of employee IDs to user info
      const linked = {};
      data.forEach(user => {
        if (user.userType === 'employee' && user.employeeId) {
          linked[user.employeeId] = {
            userId: user._id,
            username: user.username,
            name: user.name
          };
        }
      });
      setLinkedUsers(linked);
    } catch (err) {
      setError('Error fetching users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = validateForm();
    if (Object.values(errors).some(error => error !== '')) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const url = selectedEmployee
        ? `http://localhost:8080/api/employees/${selectedEmployee._id}`
        : 'http://localhost:8080/api/employees';
      
      const method = selectedEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save employee');
      
      setSuccess(selectedEmployee ? 'Employee updated successfully' : 'Employee added successfully');
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setSuccess('Employee deleted successfully');
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phoneNumber: employee.phoneNumber || '',
      role: employee.role || 'Veterinarian',
      baseSalary: employee.baseSalary || '',
      hourlyRate: employee.hourlyRate || '',
      workingHoursPerDay: employee.workingHoursPerDay || 8,
      address: employee.address || '',
      status: employee.status || 'Active'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
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
    setFormErrors({
      name: '',
      email: '',
      phoneNumber: '',
      baseSalary: '',
      hourlyRate: '',
      address: ''
    });
    setSelectedEmployee(null);
  };

  const handleLinkUser = (employee) => {
    setSelectedEmployee(employee);
    setShowLinkModal(true);
  };

  const submitLinkUser = async () => {
    if (!selectedUser || !selectedEmployee) {
      setError('Please select a user to link');
      return;
    }

    try {
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
          userId: selectedUser,
          employeeId: selectedEmployee._id
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to link user to employee');
      
      setSuccess('User linked to employee successfully');
      setShowLinkModal(false);
      setSelectedUser('');
      
      // Refresh the users list to update the linked status
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnlinkUser = async (employee) => {
    // Check if this employee is linked to a user
    if (!linkedUsers[employee._id]) {
      setError('This employee is not linked to any user account');
      return;
    }
    
    const linkedUser = linkedUsers[employee._id];
    
    if (!window.confirm(`Are you sure you want to unlink ${linkedUser.name} (${linkedUser.username}) from ${employee.name}?`)) {
      return;
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // Call the unlink API
      const response = await fetch('http://localhost:8080/api/auth/unlink-employee', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: linkedUser.userId
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to unlink user from employee');
      
      setSuccess('User unlinked from employee successfully');
      
      // Refresh the users list to update the linked status
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const generateReport = () => {
    const report = employees.map(emp => ({
      'Name': emp.name,
      'Email': emp.email,
      'Phone': emp.phoneNumber,
      'Role': emp.role,
      'Base Salary': emp.baseSalary,
      'Hourly Rate': emp.hourlyRate,
      'Status': emp.status
    }));

    const csv = [
      Object.keys(report[0]).join(','),
      ...report.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCalculateSalary = async (employeeId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const today = new Date();
      const response = await fetch(
        `http://localhost:8080/api/employees/salary/${employeeId}/${today.getFullYear()}/${today.getMonth() + 1}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch salary details');
      const data = await response.json();
      setSelectedSalaryDetails({ ...data, _id: employeeId });
      setShowSalaryModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateManualSalary = (baseSalary, leaveDays = 0, overtimeHours = 0, overtimeRate = 1.5) => {
    const dailyRate = baseSalary / 30; // Assuming 30 days in a month for simplicity
    const hourlyRate = dailyRate / 8; // Assuming 8 hours per day
    
    const overtimePay = overtimeHours * overtimeRate * hourlyRate;
    const leaveDeductions = leaveDays * dailyRate;
    
    return baseSalary + overtimePay - leaveDeductions;
  };

  const handleSaveSalary = async (employeeId, newSalary) => {
    try {
      if (!employeeId) throw new Error('Employee ID is required');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await fetch(`http://localhost:8080/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          calculatedSalary: parseFloat(newSalary)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save salary');
      
      setSuccess('Salary updated successfully');
      setShowSalaryModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveStatusUpdate = async (employeeId, leaveId, approved) => {
    try {
      // Prepare both old and new format for compatibility
      const requestBody = {
        employeeId,
        leaveId,
        status: approved ? 'approved' : 'rejected',
        approved: approved,
        rejected: !approved,
        paid: leaveStatusForm.paid,
        comment: leaveStatusForm.comment
      };

      console.log("Sending leave update request:", requestBody);

      const response = await fetch('http://localhost:8080/api/employees/leave/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log("Leave update response:", responseData);
      } catch (e) {
        console.error("Error parsing response:", e);
        responseData = { message: "Could not parse server response" };
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update leave status');
      }

      // Update the local state directly
      setEmployees(prevEmployees => {
        return prevEmployees.map(emp => {
          if (emp._id === employeeId) {
            // Create a copy of the employee
            const updatedEmployee = {...emp};
            
            // Update the leaves array
            updatedEmployee.leaves = emp.leaves.map(leave => {
              if (leave._id === leaveId) {
                const updatedLeave = {
                  ...leave,
                  status: approved ? 'approved' : 'rejected',
                  approved: approved,
                  rejected: !approved,
                  paid: leaveStatusForm.paid,
                  comment: leaveStatusForm.comment
                };
                console.log("Updated leave object:", updatedLeave);
                return updatedLeave;
              }
              return leave;
            });
            
            return updatedEmployee;
          }
          return emp;
        });
      });

      setSuccess(`Leave ${approved ? 'approved' : 'rejected'} successfully`);
      setShowLeaveDetailModal(false);
      
      // Notify parent component about the change
      if (onDataChange) onDataChange();
      
      // Force a refetch of all employees to ensure sync with server
      fetchEmployees();
    } catch (err) {
      console.error("Leave update error:", err);
      setError(err.message);
    }
  };

  const openLeaveDetailModal = (employee, leave) => {
    setSelectedEmployee(employee);
    setSelectedLeave(leave);
    // Default to paid for Vacation and Sick leaves, unpaid for Personal and Unpaid
    setLeaveStatusForm({
      paid: leave.type === 'Vacation' || leave.type === 'Sick',
      comment: ''
    });
    setShowLeaveDetailModal(true);
  };

  // Calculate days between two dates (including both start and end date)
  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format salary
  const formatSalary = (employee) => {
    if (!employee) return '0.00';
    const salary = employee.calculatedSalary || employee.baseSalary;
    return salary ? salary.toFixed(2) : '0.00';
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      phoneNumber: '',
      baseSalary: '',
      hourlyRate: '',
      address: ''
    };
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must contain only digits';
    }
    
    // Base salary validation
    if (!formData.baseSalary) {
      errors.baseSalary = 'Base salary is required';
    } else if (isNaN(formData.baseSalary) || Number(formData.baseSalary) <= 0) {
      errors.baseSalary = 'Please enter a valid base salary';
    }
    
    // Hourly rate validation
    if (!formData.hourlyRate) {
      errors.hourlyRate = 'Hourly rate is required';
    } else if (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) <= 0) {
      errors.hourlyRate = 'Please enter a valid hourly rate';
    }
    
    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    return errors;
  };
  
  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits
    if (name === 'phoneNumber' && value !== '') {
      const onlyDigits = value.replace(/[^\d]/g, '');
      setFormData({ ...formData, [name]: onlyDigits });
      
      // Validate phone number
      if (!/^\d+$/.test(onlyDigits)) {
        setFormErrors({ ...formErrors, [name]: 'Phone number must contain only digits' });
      } else {
        setFormErrors({ ...formErrors, [name]: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors({ ...formErrors, [name]: '' });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4DB6AC]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFF3E0] text-[#FF7043]">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Employees</p>
              <h3 className="text-2xl font-bold text-gray-900">{employees.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFF3E0] text-[#FF7043]">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Active Employees</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.status === 'Active').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-[#FFF3E0] text-[#FF7043]">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">On Leave</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {employees.filter(emp => emp.status === 'On Leave').length}
              </h3>
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
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4DB6AC] focus:border-[#4DB6AC]"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowModal(true); resetForm(); }}
            className="inline-flex items-center px-4 py-2 bg-[#4DB6AC] hover:bg-[#4DB6AC]/90 text-white rounded-lg transition-colors duration-200 shadow-sm"
          >
            <FiUserPlus className="w-5 h-5 mr-2" />
            <span>Add Employee</span>
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leaves</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {employee.name}
                      {linkedUsers[employee._id] && (
                        <span 
                          className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-help"
                          title={`Linked to user: ${linkedUsers[employee._id].name} (${linkedUsers[employee._id].username})`}
                        >
                          <FiUser className="w-3 h-3 mr-1" />
                          Linked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : employee.status === 'On Leave'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span>${formatSalary(employee)}</span>
                      <button
                        onClick={() => handleCalculateSalary(employee._id)}
                        className="ml-2 text-[#4DB6AC] hover:text-[#4DB6AC]/80"
                        title="Calculate Salary"
                      >
                        <FiRefreshCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">
                          Pending: {employee.leaves?.filter(l => l.status === 'pending' || (!l.status && !l.approved && !l.rejected)).length || 0}
                        </span>
                        {employee.leaves?.filter(l => l.status === 'pending' || (!l.status && !l.approved && !l.rejected)).length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowLeaveModal(true);
                            }}
                            className="ml-2 text-[#4DB6AC] hover:text-[#4DB6AC]/80 flex items-center"
                            title="Manage Leave Requests"
                          >
                            <FiCalendar className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Approved: {employee.leaves?.filter(l => l.status === 'approved' || (!l.status && l.approved)).length || 0}
                      </span>
                      <span className="text-xs text-gray-500">
                        Rejected: {employee.leaves?.filter(l => l.status === 'rejected' || (!l.status && l.rejected)).length || 0}
                      </span>
                      {employee.leaves?.filter(l => l.status === 'pending' || (!l.status && !l.approved && !l.rejected)).length > 0 && (
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={() => {
                              const pendingLeave = employee.leaves.find(l => l.status === 'pending' || (!l.status && !l.approved && !l.rejected));
                              if (pendingLeave) {
                                openLeaveDetailModal(employee, pendingLeave);
                              }
                            }}
                            className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            title="Review Leave Details"
                          >
                            <FiCalendar className="w-3 h-3 mr-1" />
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-[#4DB6AC] hover:text-[#4DB6AC]/80"
                        title="Edit Employee"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-gray-900 hover:text-gray-700"
                        title="Delete Employee"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                      {linkedUsers[employee._id] ? (
                        <button
                          onClick={() => handleUnlinkUser(employee)}
                          className="text-orange-500 hover:text-orange-700"
                          title={`Unlink from ${linkedUsers[employee._id].username}`}
                        >
                          <FiLink className="w-5 h-5 line-through" />
                        </button>
                      ) : (
                      <button
                        onClick={() => handleLinkUser(employee)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Link to User Account"
                      >
                        <FiLink className="w-5 h-5" />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    name="name"
                    className={`mt-1 block w-full rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]`}
                    required
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    name="email"
                    className={`mt-1 block w-full rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]`}
                    required
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    name="phoneNumber"
                    className={`mt-1 block w-full rounded-md ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]`}
                    required
                  />
                  {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={handleInputChange}
                    name="role"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
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
                    value={formData.baseSalary}
                    onChange={handleInputChange}
                    name="baseSalary"
                    className={`mt-1 block w-full rounded-md ${formErrors.baseSalary ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]`}
                    required
                    min="0"
                  />
                  {formErrors.baseSalary && <p className="mt-1 text-sm text-red-500">{formErrors.baseSalary}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    name="hourlyRate"
                    className={`mt-1 block w-full rounded-md ${formErrors.hourlyRate ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]`}
                    required
                    min="0"
                  />
                  {formErrors.hourlyRate && <p className="mt-1 text-sm text-red-500">{formErrors.hourlyRate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={handleInputChange}
                    name="address"
                    className={`mt-1 block w-full rounded-md ${formErrors.address ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]`}
                    required
                  />
                  {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={handleInputChange}
                    name="status"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
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
                    className="px-4 py-2 bg-[#4DB6AC] text-white rounded-md hover:bg-[#4DB6AC]/90"
                  >
                    {selectedEmployee ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Salary Details Modal */}
      {showSalaryModal && selectedSalaryDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[550px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Salary Details for {selectedSalaryDetails.employeeName}
              </h3>

              {/* Toggle Button */}
              <div className="mb-4">
                <button
                  onClick={() => setManualCalculation(!manualCalculation)}
                  className="text-[#4DB6AC] hover:text-[#4DB6AC]/80 text-sm font-medium"
                >
                  {manualCalculation ? "View Actual Calculations" : "Calculate Manually"}
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Base Salary</p>
                  <p className="text-lg font-semibold">${selectedSalaryDetails.baseSalary.toFixed(2)}</p>
                </div>

                {manualCalculation ? (
                  // Manual Calculation Form
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm text-gray-600 mb-2">Overtime Hours</label>
                      <input
                        type="number"
                        min="0"
                        value={calculationInputs.overtimeHours}
                        onChange={(e) => setCalculationInputs({
                          ...calculationInputs,
                          overtimeHours: parseFloat(e.target.value) || 0
                        })}
                        className="w-full p-2 border rounded focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      />
                      <label className="block text-sm text-gray-600 mt-2 mb-2">Overtime Rate (x)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={calculationInputs.overtimeRate}
                        onChange={(e) => setCalculationInputs({
                          ...calculationInputs,
                          overtimeRate: parseFloat(e.target.value) || 1.5
                        })}
                        className="w-full p-2 border rounded focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm text-gray-600 mb-2">Unpaid Leave Days</label>
                      <input
                        type="number"
                        min="0"
                        value={calculationInputs.unpaidLeaveDays}
                        onChange={(e) => setCalculationInputs({
                          ...calculationInputs,
                          unpaidLeaveDays: parseFloat(e.target.value) || 0
                        })}
                        className="w-full p-2 border rounded focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      />
                    </div>

                    <div className="bg-[#4DB6AC]/10 p-4 rounded-lg">
                      <p className="text-sm font-medium text-[#4DB6AC]">Calculated Total Salary</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${calculateManualSalary(
                          selectedSalaryDetails.baseSalary, 
                          calculationInputs.unpaidLeaveDays,
                          calculationInputs.overtimeHours,
                          calculationInputs.overtimeRate
                        ).toFixed(2)}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Overtime Pay: ${(calculationInputs.overtimeHours * calculationInputs.overtimeRate * (selectedSalaryDetails.baseSalary / (30 * 8))).toFixed(2)}</p>
                        <p>Leave Deductions: ${(calculationInputs.unpaidLeaveDays * (selectedSalaryDetails.baseSalary / 30)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Actual Calculations from Backend with Leave Details
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Overtime Pay</p>
                        <p className="text-sm font-semibold text-green-600">
                          +${selectedSalaryDetails.breakdown.overtime.reduce((total, ot) => 
                            total + (ot.hours * ot.rate * (selectedSalaryDetails.baseSalary / (30 * 8))), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Total Hours: {
                          selectedSalaryDetails.breakdown.overtime.reduce((total, ot) => total + ot.hours, 0)
                        }</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">Leave Impact</p>
                        {/* Calculate unpaid leave total */}
                        {(() => {
                          const unpaidLeaveTotal = selectedSalaryDetails.breakdown.leaves
                            .filter(leave => leave.approved && !leave.paid)
                            .reduce((total, leave) => {
                              const days = calculateLeaveDays(leave.startDate, leave.endDate);
                              return total + days;
                            }, 0);
                            
                          const unpaidLeaveDeduction = unpaidLeaveTotal * (selectedSalaryDetails.baseSalary / 30);
                            
                          return (
                            <p className="text-sm font-semibold text-red-600">
                              -${unpaidLeaveDeduction.toFixed(2)}
                            </p>
                          );
                        })()}
                      </div>
                      <div className="mt-2 space-y-1">
                        {selectedSalaryDetails.breakdown.leaves
                          .filter(leave => leave.approved)
                          .map((leave, idx) => {
                            const leaveDays = calculateLeaveDays(leave.startDate, leave.endDate);
                            const leaveDeduction = !leave.paid ? (leaveDays * (selectedSalaryDetails.baseSalary / 30)).toFixed(2) : '0.00';
                            
                            return (
                              <div key={idx} className="flex justify-between text-xs">
                                <span>
                                  {leave.type} ({new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()})
                                </span>
                                <span className={leave.paid ? 'text-green-600' : 'text-red-600'}>
                                  {leave.paid 
                                    ? 'Paid' 
                                    : `${leaveDays} days unpaid (-$${leaveDeduction})`}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="bg-[#4DB6AC]/10 p-4 rounded-lg">
                      <p className="text-sm font-medium text-[#4DB6AC]">Total Salary</p>
                      <p className="text-2xl font-bold text-gray-900">${selectedSalaryDetails.totalSalary.toFixed(2)}</p>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>Base: ${selectedSalaryDetails.baseSalary.toFixed(2)}</p>
                        <p>+ Overtime: ${selectedSalaryDetails.breakdown.overtime.reduce((total, ot) => 
                          total + (ot.hours * ot.rate * (selectedSalaryDetails.baseSalary / (30 * 8))), 0).toFixed(2)}</p>
                        <p>- Unpaid Leave: ${(selectedSalaryDetails.breakdown.leaves
                          .filter(leave => leave.approved && !leave.paid)
                          .reduce((total, leave) => {
                            const days = calculateLeaveDays(leave.startDate, leave.endDate);
                            return total + days;
                          }, 0) * (selectedSalaryDetails.baseSalary / 30)).toFixed(2)}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    onClick={() => setShowSalaryModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const finalSalary = manualCalculation 
                        ? calculateManualSalary(
                            selectedSalaryDetails.baseSalary, 
                            calculationInputs.unpaidLeaveDays,
                            calculationInputs.overtimeHours,
                            calculationInputs.overtimeRate
                          )
                        : selectedSalaryDetails.totalSalary;
                      handleSaveSalary(selectedSalaryDetails._id, finalSalary);
                    }}
                    className="px-4 py-2 bg-[#4DB6AC] text-white rounded-md hover:bg-[#4DB6AC]/90"
                  >
                    Save Salary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link User Modal */}
      {showLinkModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Link User to {selectedEmployee.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500">
                  This will give the selected user employee access with the role of {selectedEmployee.role}.
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
                    onClick={submitLinkUser}
                    className="px-4 py-2 bg-[#4DB6AC] text-white rounded-md hover:bg-[#4DB6AC]/90"
                  >
                    Link User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Management Modal */}
      {showLeaveModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Leave Management for {selectedEmployee.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedEmployee.leaves?.map((leave, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{leave.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {calculateLeaveDays(leave.startDate, leave.endDate)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            leave.status === 'approved' || (!leave.status && leave.approved)
                              ? 'bg-green-100 text-green-800' 
                              : leave.status === 'rejected' || (!leave.status && leave.rejected)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {leave.status === 'approved' || (!leave.status && leave.approved)
                              ? 'Approved' 
                              : leave.status === 'rejected' || (!leave.status && leave.rejected)
                              ? 'Rejected'
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            leave.paid 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {leave.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {(leave.status === 'pending' || (!leave.status && !leave.approved && !leave.rejected)) && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openLeaveDetailModal(selectedEmployee, leave)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Review Leave Details"
                              >
                                Review
                              </button>
                            </div>
                          )}
                          {(leave.status !== 'pending' || (!leave.status && (leave.approved || leave.rejected))) && leave.comment && (
                            <button
                              onClick={() => {
                                alert(`Comment: ${leave.comment}`);
                              }}
                              className="text-gray-600 hover:text-gray-800"
                              title="View Comment"
                            >
                              View Comment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Detail Review Modal */}
      {showLeaveDetailModal && selectedEmployee && selectedLeave && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[550px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Leave Request
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Employee</p>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Leave Type</p>
                    <p className="font-medium">{selectedLeave.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">{new Date(selectedLeave.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium">{new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Days</p>
                    <p className="font-medium">{calculateLeaveDays(selectedLeave.startDate, selectedLeave.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedLeave.status === 'approved' || (!selectedLeave.status && selectedLeave.approved)
                          ? 'bg-green-100 text-green-800' 
                          : selectedLeave.status === 'rejected' || (!selectedLeave.status && selectedLeave.rejected)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedLeave.status === 'approved' || (!selectedLeave.status && selectedLeave.approved)
                          ? 'Approved' 
                          : selectedLeave.status === 'rejected' || (!selectedLeave.status && selectedLeave.rejected)
                          ? 'Rejected'
                          : 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
                
                {selectedLeave.reason && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="text-sm bg-white p-2 rounded border mt-1">{selectedLeave.reason}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={leaveStatusForm.paid}
                    onChange={(e) => setLeaveStatusForm({...leaveStatusForm, paid: e.target.checked})}
                    className="h-4 w-4 text-[#4DB6AC] focus:ring-[#4DB6AC] border-gray-300 rounded"
                    id="paidLeaveCheck"
                  />
                  <label htmlFor="paidLeaveCheck" className="ml-2 block text-sm text-gray-700">
                    Paid Leave
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comment (Optional)</label>
                  <textarea
                    value={leaveStatusForm.comment}
                    onChange={(e) => setLeaveStatusForm({...leaveStatusForm, comment: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    rows="2"
                  />
                </div>
                
                <div className="flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLeaveDetailModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLeaveStatusUpdate(selectedEmployee._id, selectedLeave._id, false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLeaveStatusUpdate(selectedEmployee._id, selectedLeave._id, true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-medium">Note:</p>
                  <p>For {selectedLeave.type}: {leaveStatusForm.paid ? 'Paid leave will not affect salary calculation' : 'Unpaid leave will reduce the monthly salary'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
