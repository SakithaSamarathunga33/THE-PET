import React, { useState, useEffect } from "react";
import { FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiRefreshCcw, FiLink } from 'react-icons/fi';

const EmployeeManagement = () => {
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
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchEmployees();
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
      const response = await fetch('http://localhost:8080/api/employees', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching employees');
      setLoading(false);
    }
  };

  // Fetch users for linking
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
    } catch (err) {
      setError('Error fetching users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    setSelectedEmployee(null);
  };

  const handleLinkUser = (employee) => {
    setSelectedEmployee(employee);
    fetchUsers();
    setShowLinkModal(true);
  };

  const submitLinkUser = async () => {
    if (!selectedUser || !selectedEmployee) {
      setError('Please select a user to link');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/link-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const today = new Date();
      const response = await fetch(
        `http://localhost:8080/api/employees/salary/${employeeId}/${today.getFullYear()}/${today.getMonth() + 1}`,
        {
          credentials: 'include',
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

  const calculateManualSalary = (baseSalary) => {
    const overtimePay = calculationInputs.overtimeHours * calculationInputs.overtimeRate * (baseSalary / (30 * 8));
    const leaveDeductions = calculationInputs.unpaidLeaveDays * (baseSalary / 30);
    return baseSalary + overtimePay - leaveDeductions;
  };

  const handleSaveSalary = async (employeeId, newSalary) => {
    try {
      if (!employeeId) throw new Error('Employee ID is required');
      
      const response = await fetch(`http://localhost:8080/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
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
                      <button
                        onClick={() => handleLinkUser(employee)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Link to User Account"
                      >
                        <FiLink className="w-5 h-5" />
                      </button>
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
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
          <div className="relative top-20 mx-auto p-5 border w-[480px] shadow-lg rounded-md bg-white">
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
                  <p className="text-lg font-semibold">${selectedSalaryDetails.baseSalary}</p>
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
                        ${calculateManualSalary(selectedSalaryDetails.baseSalary).toFixed(2)}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Overtime Pay: ${(calculationInputs.overtimeHours * calculationInputs.overtimeRate * (selectedSalaryDetails.baseSalary / (30 * 8))).toFixed(2)}</p>
                        <p>Leave Deductions: ${(calculationInputs.unpaidLeaveDays * (selectedSalaryDetails.baseSalary / 30)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Actual Calculations from Backend
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Overtime Pay</p>
                      <p className="text-lg font-semibold">
                        ${selectedSalaryDetails.breakdown.overtime.reduce((total, ot) => 
                          total + (ot.hours * ot.rate), 0)}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Total Hours: {
                          selectedSalaryDetails.breakdown.overtime.reduce((total, ot) => total + ot.hours, 0)
                        }</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Leave Deductions</p>
                      <p className="text-lg font-semibold text-red-600">
                        -${selectedSalaryDetails.breakdown.leaves.filter(leave => !leave.paid).length * 
                          (selectedSalaryDetails.baseSalary / 30)}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Unpaid Leave Days: {
                          selectedSalaryDetails.breakdown.leaves.filter(leave => !leave.paid).length
                        }</p>
                      </div>
                    </div>

                    <div className="bg-[#4DB6AC]/10 p-4 rounded-lg">
                      <p className="text-sm font-medium text-[#4DB6AC]">Total Salary</p>
                      <p className="text-2xl font-bold text-gray-900">${selectedSalaryDetails.totalSalary}</p>
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
                        ? calculateManualSalary(selectedSalaryDetails.baseSalary)
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
    </div>
  );
};

export default EmployeeManagement;
