import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUser, FiCalendar, FiClock, FiDollarSign, FiFileText, FiLogOut, FiHome, FiMenu } from 'react-icons/fi';
import Link from 'next/link';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 

const EmployeePage = () => {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const [date, setDate] = useState(new Date());

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

  const isAttendanceDate = (date) => {
    if (!employee || !employee.attendance) return false;
    return employee.attendance.some(att => {
      const attDate = new Date(att.date);
      return attDate.getDate() === date.getDate() && attDate.getMonth() === date.getMonth() && attDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation Bar */}
          <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center h-16">
              {/* Logo Section */}
              <div className="flex items-center">
                <Link href="/" className="text-[#00796B] font-extrabold text-2xl tracking-wide">
                  PetCare Portal
                </Link>
              </div>

              {/* User Section */}
              <div className="flex items-center space-x-6">
                <span className="text-gray-800 font-medium text-lg">{username}</span>
                
                {/* Profile Icon */}
                <div className="w-10 h-10 rounded-full bg-[#00796B] flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {username ? username.charAt(0).toUpperCase() : 'E'}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Employee Profile</h1>
          </div>
        </div>
          <div className="container mx-auto px-4 py-8">
            {/* Employee Profile */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 transition-all hover:shadow-2xl">


          {employee && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Icon */}
              <div className="p-5 rounded-full bg-gradient-to-r from-[#4DB6AC] to-[#00796B] text-white shadow-md">
                <FiUser className="w-16 h-16" />
              </div>

              {/* Employee Details */}
              <div>
                <h2 className="text-2xl font-bold text-[#00796B]">{employee.name}</h2>
                <p className="text-gray-700 text-lg font-medium">{employee.role}</p>
                <p className="text-gray-500 text-sm">{employee.email} | {employee.phoneNumber}</p>

                {/* Status Badge */}
                <div className="mt-3">
                  <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm 
                      ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-800 border border-green-300 shadow-sm'
                          : employee.status === 'On Leave'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 shadow-sm'
                          : 'bg-red-100 text-red-800 border border-red-300 shadow-sm'
                      }`}
                  >
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>


              {/* Personal Info, Salary, Leaves, and Attendance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">Personal Information</h3>
          {employee && (
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: employee.name },
                { label: 'Email', value: employee.email },
                { label: 'Phone', value: employee.phoneNumber },
                { label: 'Address', value: employee.address },
                { label: 'Role', value: employee.role },
                { label: 'Status', value: employee.status },
                { label: 'Joining Date', value: new Date(employee.joiningDate).toLocaleDateString() },
              ].map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium">{item.label}:</span>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salary Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">Salary Information</h3>
          {employee && (
            <div className="space-y-4">
              {[
                { label: 'Base Salary', value: `$${employee.baseSalary.toFixed(2)}` },
                { label: 'Hourly Rate', value: `$${employee.hourlyRate.toFixed(2)}` },
                { label: 'Working Hours/Day', value: `${employee.workingHoursPerDay} hours` },
                {
                  label: 'Current Salary',
                  value: `$${(employee.calculatedSalary || employee.baseSalary).toFixed(2)}`,
                  className: 'text-[#4DB6AC] font-extrabold',
                },
              ].map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                  <span className="text-gray-600 font-medium">{item.label}:</span>
                  <span className={`font-semibold ${item.className || 'text-gray-800'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">Leave Information</h3>
          {employee && employee.leaves && employee.leaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    {['Type', 'From', 'To', 'Status'].map((header, index) => (
                      <th key={index} className="px-4 py-3 text-left text-sm font-semibold uppercase">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employee.leaves.map((leave, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3 text-gray-900">{leave.type}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(leave.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(leave.endDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          leave.approved 
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          {leave.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No leave records found</p>
          )}
        </div>
      </div>

          {/* Attendance Calendar */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all hover:shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">Attendance Calendar</h3>

          <div className="flex flex-col items-center">
            <Calendar
              onChange={setDate}
              value={date}
              minDate={new Date('2023-01-01')}
              maxDate={new Date()}
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

          <div className="mt-4 text-center bg-gray-100 py-3 rounded-lg">
            <p className="text-gray-700 font-medium">
              Selected Date: <span className="text-[#4DB6AC] font-bold">{date.toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
