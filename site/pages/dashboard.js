import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserManagement from "../components/user/UserManagement";
import SupplierManagement from "../components/supplier/SupplierManagement";
import InventoryManagement from "../components/inventory/InventoryManagement";
import AppointmentManagement from "../components/appointment/AppointmentManagement";
import { FiUsers, FiPackage, FiShoppingBag, FiCalendar, FiLogOut, FiMenu, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { MdPets } from 'react-icons/md';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    appointments: [],
    recentActivities: []
  });
  const router = useRouter();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use existing user management endpoint
      const userResponse = await fetch('http://localhost:8080/api/auth/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!userResponse.ok) throw new Error('Failed to fetch users');
      const userData = await userResponse.json();

      // Calculate user statistics
      const totalUsers = userData.length;
      const adminUsers = userData.filter(user => user.userType === 'admin').length;
      const regularUsers = userData.filter(user => user.userType === 'user').length;

      // Get recent activities from user data
      const recentActivities = userData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(user => ({
          description: `New user registered: ${user.name}`,
          timestamp: new Date(user.createdAt).toLocaleString(),
          type: 'user'
        }));

      setDashboardData({
        users: userData,
        totalUsers,
        adminUsers,
        regularUsers,
        recentActivities
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Chart data with real appointments data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Appointments',
        data: dashboardData.appointmentTrends || [0, 0, 0, 0, 0, 0],
        borderColor: '#f97316',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Appointment Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiTrendingUp className="w-5 h-5" /> },
    { id: "user", label: "Users", icon: <FiUsers className="w-5 h-5" /> },
    { id: "supplier", label: "Suppliers", icon: <FiPackage className="w-5 h-5" /> },
    { id: "inventory", label: "Inventory", icon: <FiShoppingBag className="w-5 h-5" /> },
    { id: "appointment", label: "Appointments", icon: <FiCalendar className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      sessionStorage.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const DashboardContent = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Users', 
            value: dashboardData.totalUsers || 0, 
            icon: <FiUsers className="w-6 h-6" />, 
            color: 'bg-orange-500',
            trend: 'Total registered users'
          },
          { 
            title: 'Admin Users', 
            value: dashboardData.adminUsers || 0, 
            icon: <FiUsers className="w-6 h-6" />, 
            color: 'bg-gray-900',
            trend: 'Administrator accounts'
          },
          { 
            title: 'Regular Users', 
            value: dashboardData.regularUsers || 0, 
            icon: <FiUsers className="w-6 h-6" />, 
            color: 'bg-orange-500',
            trend: 'Standard user accounts'
          },
          { 
            title: 'Active Users', 
            value: dashboardData.users?.filter(user => user.isActive)?.length || 0, 
            icon: <FiUsers className="w-6 h-6" />, 
            color: 'bg-gray-900',
            trend: 'Currently active users'
          },
        ].map((stat, index) => (
          <div key={index} 
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-xs text-gray-600 mt-1">{stat.trend}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">User Registration Trends</h3>
          <Line 
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'New Users',
                data: [
                  dashboardData.users?.filter(user => new Date(user.createdAt).getMonth() === 0).length || 0,
                  dashboardData.users?.filter(user => new Date(user.createdAt).getMonth() === 1).length || 0,
                  dashboardData.users?.filter(user => new Date(user.createdAt).getMonth() === 2).length || 0,
                  dashboardData.users?.filter(user => new Date(user.createdAt).getMonth() === 3).length || 0,
                  dashboardData.users?.filter(user => new Date(user.createdAt).getMonth() === 4).length || 0,
                  dashboardData.users?.filter(user => new Date(user.createdAt).getMonth() === 5).length || 0,
                ],
                borderColor: '#f97316',
                tension: 0.4,
                fill: false,
              }]
            }} 
            options={chartOptions} 
          />
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent User Activities</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {dashboardData.recentActivities?.map((activity, index) => (
              <div key={index} 
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            {!dashboardData.recentActivities?.length && (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center justify-between p-4 border-b bg-orange-500">
            {isSidebarOpen && (
              <div className="flex items-center">
                <MdPets className="w-8 h-8 text-white" />
                <h1 className="text-xl font-bold text-white ml-2">PetCare</h1>
              </div>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-orange-600 text-white"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center w-full p-3 rounded-lg transition-all duration-200
                      ${activeTab === item.id 
                        ? 'bg-orange-500 text-white shadow-md transform scale-105' 
                        : 'text-gray-600 hover:bg-orange-50'
                      }`}
                  >
                    {item.icon}
                    {isSidebarOpen && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all duration-200"
            >
              <FiLogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  A
                </div>
                <span className="text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8 overflow-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "user" && <UserManagement />}
          {activeTab === "supplier" && <SupplierManagement />}
          {activeTab === "inventory" && <InventoryManagement />}
          {activeTab === "appointment" && <AppointmentManagement />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
