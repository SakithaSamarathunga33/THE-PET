import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiCalendar, FiClock, FiDollarSign, FiFileText, FiLogOut, FiHome, FiMenu, FiPlus, FiBriefcase, FiMail, FiPhone, FiMapPin, FiChevronRight, FiSettings, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 

const EmployeePage = () => {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [date, setDate] = useState(new Date());

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
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('userType');
      localStorage.removeItem('employeeId');
      sessionStorage.clear();
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4F959D]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <FiAlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Error</h2>
          <p className="text-center text-gray-600">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-6 w-full py-2 px-4 bg-[#4F959D] hover:bg-[#4F959D]/90 text-white font-medium rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const isAttendanceDate = (date) => {
    if (!employee || !employee.attendance) return false;
    return employee.attendance.some(att => {
      const attDate = new Date(att.date);
      return (
        attDate.getDate() === date.getDate() &&
        attDate.getMonth() === date.getMonth() &&
        attDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title with Logout Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {employee?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
            title="Logout"
                >
            <FiLogOut className="mr-2" />
            <span>Logout</span>
                </button>
        </div>

        {/* Employee Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gradient-to-r from-[#4F959D] to-[#205781] p-6 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                <FiUser className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="p-6 md:p-8 w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee?.name}</h2>
                  <p className="text-lg text-gray-600">{employee?.role}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-1 h-4 w-4" />
                      <span className="text-sm">{employee?.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiPhone className="mr-1 h-4 w-4" />
                      <span className="text-sm">{employee?.phoneNumber}</span>
          </div>
        </div>
          </div>
          
                <div className="mt-4 md:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    employee?.status === 'Active'
                      ? 'bg-green-100 text-green-800' 
                      : employee?.status === 'On Leave'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`h-2 w-2 rounded-full mr-1 ${
                      employee?.status === 'Active'
                        ? 'bg-green-500'
                        : employee?.status === 'On Leave'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}></span>
                    {employee?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Personal Info & Salary */}
          <div className="md:col-span-1 space-y-8">
          {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#4F959D] to-[#205781]">
                <div className="flex items-center">
                  <FiBriefcase className="h-5 w-5 text-white mr-2" />
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>
              </div>
              <div className="p-6">
                {employee && (
                  <div className="space-y-4">
                    {[
                      { icon: <FiUser />, label: 'Full Name', value: employee.name },
                      { icon: <FiMail />, label: 'Email', value: employee.email },
                      { icon: <FiPhone />, label: 'Phone', value: employee.phoneNumber },
                      { icon: <FiMapPin />, label: 'Address', value: employee.address },
                      { icon: <FiBriefcase />, label: 'Role', value: employee.role },
                      { icon: <FiCalendar />, label: 'Joining Date', value: new Date(employee.joiningDate).toLocaleDateString() },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                        <div className="text-[#4F959D] mr-3 mt-1">{item.icon}</div>
                        <div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className="font-medium text-gray-800">{item.value}</p>
                </div>
                </div>
                    ))}
                </div>
                )}
                </div>
                </div>

            {/* Salary Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#4F959D] to-[#205781]">
                <div className="flex items-center">
                  <FiDollarSign className="h-5 w-5 text-white mr-2" />
                  <h3 className="text-lg font-semibold text-white">Salary Information</h3>
                </div>
              </div>
              <div className="p-6">
                {employee && (
                  <div className="space-y-4">
                    <div className="bg-[#98D2C0]/20 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">Current Salary</p>
                      <p className="text-2xl font-bold text-[#205781]">
                        ${(employee.calculatedSalary || employee.baseSalary).toFixed(2)}
                      </p>
                    </div>
                    
                    {[
                      { icon: <FiDollarSign />, label: 'Base Salary', value: `$${employee.baseSalary.toFixed(2)}` },
                      { icon: <FiClock />, label: 'Hourly Rate', value: `$${employee.hourlyRate.toFixed(2)}` },
                      { icon: <FiClock />, label: 'Working Hours/Day', value: `${employee.workingHoursPerDay} hours` },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                        <div className="text-[#4F959D] mr-3 mt-1">{item.icon}</div>
                        <div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className="font-medium text-gray-800">{item.value}</p>
                        </div>
                      </div>
                    ))}
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Middle Column - Leave Management */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#4F959D] to-[#205781]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiCalendar className="h-5 w-5 text-white mr-2" />
                    <h3 className="text-lg font-semibold text-white">Leave Management</h3>
                </div>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="p-1.5 bg-white rounded-full text-[#205781] hover:bg-gray-100"
                    title="Apply for Leave"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Leave History */}
                {!employee?.leaves?.length && (
                  <div className="text-center py-8">
                    <FiCalendar className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No leave records found</p>
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4F959D] hover:bg-[#4F959D]/90"
                    >
                      <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                      Apply for Leave
                    </button>
              </div>
            )}

                {(employee?.leaves?.length > 0) && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                      <tbody className="divide-y divide-gray-200">
                    {employee.leaves.map((leave, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{leave.type}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString()}
                        </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                leave.status === 'approved' || leave.approved 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : leave.status === 'rejected' || leave.rejected
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              }`}>
                                {leave.status === 'approved' || leave.approved 
                                  ? 'Approved' 
                                  : leave.status === 'rejected' || leave.rejected
                                  ? 'Rejected'
                                  : 'Pending'}
                                {leave.paid && (leave.status === 'approved' || leave.approved) && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Paid</span>
                                )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Right Column - Attendance Calendar */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#4F959D] to-[#205781]">
                <div className="flex items-center">
                  <FiClock className="h-5 w-5 text-white mr-2" />
                  <h3 className="text-lg font-semibold text-white">Attendance Calendar</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-full mb-4">
                    <Calendar
                      onChange={setDate}
                      value={date}
                      minDate={new Date('2023-01-01')}
                      maxDate={new Date()}
                      className="rounded-lg border shadow-sm"
                      tileClassName={({ date, view }) => {
                        if (view === 'month' && isAttendanceDate(date)) {
                          const attendance = employee.attendance.find(att => {
                            const attDate = new Date(att.date);
                            return (
                              attDate.getDate() === date.getDate() &&
                              attDate.getMonth() === date.getMonth() &&
                              attDate.getFullYear() === date.getFullYear()
                            );
                          });

                          return attendance
                            ? `relative rounded-lg px-2 py-1 font-semibold transition-all ${
                                attendance.present
                                  ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                              }`
                            : '';
                        }
                      }}
                    />
                  </div>

                  <div className="w-full flex items-center justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Absent</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center bg-[#F6F8D5] py-3 px-4 rounded-lg w-full">
                    <p className="text-gray-700 text-sm">
                      Selected Date: <span className="text-[#205781] font-medium">{date.toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Application Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-[#4F959D] to-[#205781] flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Apply for Leave</h3>
                <button 
                  onClick={() => setShowLeaveModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {leaveError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <FiAlertCircle className="mr-2" />
                    {leaveError}
                  </div>
                )}
                {leaveSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {leaveSuccess}
                  </div>
                )}
                
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                      value={leaveForm.type}
                      onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                      required
                    >
                      <option value="Vacation">Vacation</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                    <textarea
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4F959D] focus:border-transparent"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-[#4F959D] hover:bg-[#4F959D]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F959D]"
                    >
                      Submit Application
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
