import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiCalendar, FiClock, FiDollarSign, FiFileText, FiLogOut, FiHome, FiMenu, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

const EmployeePage = () => {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [leaveError, setLeaveError] = useState(null);
  const [leaveSuccess, setLeaveSuccess] = useState(null);

  useEffect(() => {
    // Check if user is logged in and is an employee
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const employeeId = localStorage.getItem('employeeId');
    const storedUsername = localStorage.getItem('username');

    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (!token || userType !== 'employee' || !employeeId) {
      router.push('/login');
      return;
    }

    fetchEmployeeData(employeeId);
  }, [router]);

  const fetchEmployeeData = async (employeeId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/employees/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employee data');
      }

      const data = await response.json();
      setEmployee(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError('Failed to load employee data. Please try again later.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('userType');
      localStorage.removeItem('employeeId');
      sessionStorage.clear();
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/employees/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: employee._id,
          ...leaveForm
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit leave application');
      }

      setLeaveSuccess('Leave application submitted successfully');
      setShowLeaveModal(false);
      setLeaveForm({
        type: 'Vacation',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchEmployeeData(employee._id); // Refresh employee data
    } catch (error) {
      setLeaveError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4DB6AC]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-[#4DB6AC] font-bold text-xl">
                  PetCare Portal
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{username}</span>
                <div className="w-8 h-8 rounded-full bg-[#4DB6AC] flex items-center justify-center text-white">
                  {username ? username.charAt(0).toUpperCase() : 'E'}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
          </div>
          
          {employee && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="bg-[#4DB6AC]/10 p-4 rounded-full">
                <FiUser className="w-12 h-12 text-[#4DB6AC]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{employee.name}</h2>
                <p className="text-gray-600">{employee.role}</p>
                <p className="text-gray-500 text-sm">{employee.email} | {employee.phoneNumber}</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    employee.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : employee.status === 'On Leave'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            {employee && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Full Name:</span>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{employee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{employee.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">{employee.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{employee.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{employee.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Joining Date:</span>
                  <span className="font-medium">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Information</h3>
            {employee && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary:</span>
                  <span className="font-medium">${employee.baseSalary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-medium">${employee.hourlyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Working Hours/Day:</span>
                  <span className="font-medium">{employee.workingHoursPerDay} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Salary:</span>
                  <span className="font-medium text-[#4DB6AC]">
                    ${(employee.calculatedSalary || employee.baseSalary).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Leave Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Leave Management</h2>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="inline-flex items-center px-4 py-2 bg-[#4DB6AC] text-white rounded-lg hover:bg-[#4DB6AC]/90 transition-colors duration-200"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Apply for Leave
              </button>
            </div>

            {/* Leave History */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employee?.leaves?.map((leave, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{leave.type}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.approved ? 'Approved' : 'Pending'}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attendance Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Attendance</h3>
            {employee && employee.attendance && employee.attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employee.attendance.slice(0, 5).map((att, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(att.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            att.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {att.present ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {att.hoursWorked ? att.hoursWorked.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No attendance records found</p>
            )}
          </div>
        </div>

        {/* Leave Application Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Apply for Leave</h3>
                {leaveError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {leaveError}
                  </div>
                )}
                {leaveSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    {leaveSuccess}
                  </div>
                )}
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select
                      value={leaveForm.type}
                      onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      required
                    >
                      <option value="Vacation">Vacation</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason for Leave</label>
                    <textarea
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4DB6AC] focus:ring-[#4DB6AC]"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4DB6AC] text-white rounded-md hover:bg-[#4DB6AC]/90"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage; 