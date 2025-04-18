import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserManagement from "../components/user/UserManagement";
import EmployeeManagement from "../components/employee/EmployeeManagement";
import PetManagement from "../components/pet/petManagement";
import InventoryManagement from "../components/inventory/InventoryManagement";
import SupplierManagement from "../components/supplier/SupplierManagement";
import AppointmentManagement from "../components/appointment/AppointmentManagement";
import ForumManagement from "../components/forum/ForumManagement";
import BranchAnalytics from "../components/dashboard/BranchAnalytics";
import { FiUsers, FiPackage, FiShoppingBag, FiCalendar, FiLogOut, FiMenu, FiTrendingUp, FiUserPlus, FiBarChart2 } from 'react-icons/fi';
import { MdPets, MdForum } from 'react-icons/md';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Link from "next/link";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
    employees: [],
    pets: [],
    appointments: [],
    inventory: [],
    recentActivities: []
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analytics, setAnalytics] = useState({
    currentMetrics: {},
    predictions: {
      'Colombo Branch': { total: 0, byPetType: {} },
      'Kandy Branch': { total: 0, byPetType: {} },
      'Galle Branch': { total: 0, byPetType: {} },
      'Jaffna Branch': { total: 0, byPetType: {} }
    }
  });
  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (!userType || userType !== 'admin') {
      console.log('Not authorized as admin, redirecting...');
      router.push('/login');
    }
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAllData(token);
  }, []);

  // Refetch data when active tab changes (to keep data in sync)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchAllData(token);
    }
  }, [activeTab]);

  // Add effect to fetch analytics when tab changes to analytics
  useEffect(() => {
    if (activeTab === 'analytics') {
      const token = localStorage.getItem('token');
      if (token) {
        fetchAnalytics(token);
      }
    }
  }, [activeTab]);

  // Enhanced analytics update handling
  useEffect(() => {
    const handleAppointmentUpdate = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await fetchAnalytics(token);
      }
    };

    window.addEventListener('appointmentUpdated', handleAppointmentUpdate);
    return () => {
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdate);
    };
  }, []); // Remove activeTab dependency to always listen

  const fetchAllData = async (token) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data in parallel
      const [users, employees, pets, appointments, inventory] = await Promise.all([
        fetch('http://localhost:8080/api/auth/user', { headers }).then(res => res.json()),
        fetch('http://localhost:8080/api/employees', { headers }).then(res => res.json()),
        fetch('http://localhost:8080/api/pets', { headers }).then(res => res.json()),
        fetch('http://localhost:8080/api/appointments', { headers }).then(res => res.json()),
        fetch('http://localhost:8080/api/inventory', { headers }).then(res => res.json())
      ]);

      // Get all activities sorted by date
      const allActivities = [
        ...users.map(user => ({
          description: `New user registered: ${user.name}`,
          timestamp: new Date(user.createdAt).toLocaleString(),
          type: 'user'
        })),
        ...appointments.map(apt => ({
          description: `New appointment: ${apt.petName}`,
          timestamp: new Date(apt.date).toLocaleString(),
          type: 'appointment'
        })),
        ...pets.map(pet => ({
          description: `New pet registered: ${pet.name}`,
          timestamp: new Date(pet.createdAt).toLocaleString(),
          type: 'pet'
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
       .slice(0, 10);

      // Calculate monthly trends
      const currentYear = new Date().getFullYear();
      const monthlyData = {
        users: Array(6).fill(0),
        appointments: Array(6).fill(0),
        pets: Array(6).fill(0)
      };

      // Process users data
      users.forEach(user => {
        const month = new Date(user.createdAt).getMonth();
        if (month <= 5) monthlyData.users[month]++;
      });

      // Process appointments data
      appointments.forEach(apt => {
        const month = new Date(apt.date).getMonth();
        if (month <= 5) monthlyData.appointments[month]++;
      });

      // Process pets data
      pets.forEach(pet => {
        const month = new Date(pet.createdAt).getMonth();
        if (month <= 5) monthlyData.pets[month]++;
      });

      setDashboardData({
        users,
        employees,
        pets,
        appointments,
        inventory,
        recentActivities: allActivities,
        totalUsers: users.length,
        totalEmployees: employees.length,
        totalPets: pets.length,
        totalAppointments: appointments.length,
        totalInventory: inventory.length,
        monthlyTrends: monthlyData
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async (token) => {
    setAnalyticsData(null); // Show loading spinner while fetching
    try {
      // 1. Fetch current metrics (historical data)
      const metricsResponse = await fetch('http://localhost:8080/api/analytics/branch', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!metricsResponse.ok) {
        console.error(`Current metrics fetch failed: ${metricsResponse.status} ${metricsResponse.statusText}`);
        // Still continue to try AI predictions even if current metrics fail
      }

      // Default branches to try if no metrics are available
      const fallbackBranches = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];
      
      // Parse metrics data or create empty structure
      let metricsData = { currentMetrics: {} };
      try {
        metricsData = await metricsResponse.json();
      } catch (error) {
        console.error("Failed to parse metrics response:", error);
      }
      
      const currentMetrics = metricsData.currentMetrics || {}; // Get metrics, default to empty object

      // 2. Identify branches from metrics or use fallbacks
      let branches = Object.keys(currentMetrics);
      if (branches.length === 0) {
        console.log("No branches found in current metrics, using fallback branches");
        branches = fallbackBranches;
        
        // Initialize empty metrics for fallback branches
        branches.forEach(branch => {
          currentMetrics[branch] = {
            total: 0,
            monthly: Array(12).fill(0),
            petTypeStats: {
              'Dog': 0, 
              'Cat': 0, 
              'Bird': 0, 
              'Fish': 0, 
              'Rabbit': 0
            }
          };
        });
      }

      // 3. Fetch AI predictions for each branch
      console.log("Fetching predictions for branches:", branches);
      const predictionPromises = branches.map(branch =>
        fetch(`http://localhost:8080/api/analytics/branch/predictions?branch=${encodeURIComponent(branch)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }).then(res => {
          if (!res.ok) {
            console.error(`Prediction fetch failed for ${branch}: ${res.status} ${res.statusText}`);
            // Return a default structure on failure for this branch
            return { branch, total_predicted: 0, error: `Fetch failed: ${res.status}` };
          }
          return res.json();
        }).catch(error => {
            console.error(`Error fetching prediction for ${branch}:`, error);
             // Return a default structure on catch
            return { branch, total_predicted: 0, error: error.message };
        })
      );

      const predictionResults = await Promise.all(predictionPromises);
      console.log("Prediction results:", predictionResults);

      // 4. Structure AI predictions
      const aiPredictions = {};
      branches.forEach(branch => {
        // Initialize with default structure
        aiPredictions[branch] = {
          total: 0,
          byPetType: {
            'Dog': 0, 
            'Cat': 0, 
            'Bird': 0, 
            'Fish': 0, 
            'Rabbit': 0
          },
          mostPopularType: 'Dog' // Default
        };
      });

      // Update with real data where available
      predictionResults.forEach(result => {
        if (result && result.branch) {
          // Calculate the most popular pet type based on the historical data
          const branch = result.branch;
          let mostPopularType = 'Dog'; // default
          
          if (currentMetrics[branch] && currentMetrics[branch].petTypeStats) {
            // Find the pet type with the highest count
            const petTypeStats = currentMetrics[branch].petTypeStats;
            let maxCount = 0;
            
            Object.entries(petTypeStats).forEach(([type, count]) => {
              if (count > maxCount) {
                maxCount = count;
                mostPopularType = type;
              }
            });
          }
          
          // Keep existing default structure and just update what we have
          aiPredictions[result.branch] = {
            ...aiPredictions[result.branch],
            total: result.total_predicted !== undefined ? result.total_predicted : 0,
            forecastData: result.forecast || [],
            mostPopularType: mostPopularType
          };

          // If Prophet provides the data, store the error info
          if (result.error) {
            console.warn(`Warning for ${result.branch} prediction:`, result.error);
            aiPredictions[result.branch].error = result.error;
          }
        }
      });

      // 5. Combine metrics and AI predictions & update state
      const combinedData = {
        currentMetrics: currentMetrics,
        predictions: aiPredictions
      };

      console.log("Final analytics data:", combinedData);
      setAnalytics(combinedData);
      setAnalyticsData(combinedData); // Update analyticsData to render

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      // Create a minimal fallback structure with empty data that BranchAnalytics can render
      const fallbackBranches = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];
      const fallbackPetTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'];
      
      const fallbackMetrics = {};
      const fallbackPredictions = {};
      
      fallbackBranches.forEach(branch => {
        // Create minimal metrics structure
        fallbackMetrics[branch] = {
          total: 0,
          monthly: Array(12).fill(0),
          petTypeStats: {}
        };
        
        // Add empty pet type stats
        fallbackPetTypes.forEach(type => {
          fallbackMetrics[branch].petTypeStats[type] = 0;
        });
        
        // Create minimal predictions structure  
        fallbackPredictions[branch] = {
          total: 0,
          byPetType: {},
          mostPopularType: 'Unknown'
        };
        
        // Add empty pet type predictions
        fallbackPetTypes.forEach(type => {
          fallbackPredictions[branch].byPetType[type] = 0;
        });
      });
      
      const fallbackData = {
        currentMetrics: fallbackMetrics,
        predictions: fallbackPredictions
      };
      
      setAnalytics(fallbackData);
      setAnalyticsData(fallbackData);
    }
  };

  // Update chart data with real data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: dashboardData.monthlyTrends?.users || Array(6).fill(0),
        borderColor: '#205781',
        backgroundColor: 'rgba(32, 87, 129, 0.2)',
        tension: 0.4,
        fill: true,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#205781',
      },
      {
        label: 'Appointments',
        data: dashboardData.monthlyTrends?.appointments || Array(6).fill(0),
        borderColor: '#4F959D',
        backgroundColor: 'rgba(79, 149, 157, 0.2)',
        tension: 0.4,
        fill: true,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#4F959D',
      },
      {
        label: 'New Pets',
        data: dashboardData.monthlyTrends?.pets || Array(6).fill(0),
        borderColor: '#98D2C0',
        backgroundColor: 'rgba(152, 210, 192, 0.2)',
        tension: 0.4,
        fill: true,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#98D2C0',
      }
    ],
  };

  // Update chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Trends'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FiTrendingUp className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <FiBarChart2 className="w-5 h-5" /> },
    { id: "user", label: "Users", icon: <FiUsers className="w-5 h-5" /> },
    { id: "employee", label: "Employees", icon: <FiUserPlus className="w-5 h-5" /> },
    { id: "pet", label: "Pets", icon: <MdPets className="w-5 h-5" /> },
    { id: "inventory", label: "Inventory", icon: <FiPackage className="w-5 h-5" /> },
    { id: "supplier", label: "Suppliers", icon: <FiShoppingBag className="w-5 h-5" /> },
    { id: "appointment", label: "Appointments", icon: <FiCalendar className="w-5 h-5" /> },
    { id: "forum", label: "Forum", icon: <MdForum className="w-5 h-5" /> },
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { 
            title: 'Total Users', 
            value: dashboardData.totalUsers || 0, 
            icon: <FiUsers className="w-6 h-6" />, 
            color: 'bg-[#205781]',
            trend: 'Total registered users'
          },
          { 
            title: 'Employees', 
            value: dashboardData.totalEmployees || 0, 
            icon: <FiUserPlus className="w-6 h-6" />, 
            color: 'bg-[#4F959D]',
            trend: 'Active employees'
          },
          { 
            title: 'Pets', 
            value: dashboardData.totalPets || 0, 
            icon: <MdPets className="w-6 h-6" />, 
            color: 'bg-[#205781]',
            trend: 'Registered pets'
          },
          { 
            title: 'Appointments', 
            value: dashboardData.totalAppointments || 0, 
            icon: <FiCalendar className="w-6 h-6" />, 
            color: 'bg-[#4F959D]',
            trend: 'Total appointments'
          },
          { 
            title: 'Inventory Items', 
            value: dashboardData.totalInventory || 0, 
            icon: <FiPackage className="w-6 h-6" />, 
            color: 'bg-[#205781]',
            trend: 'Available items'
          },
          { 
            title: 'Active Users', 
            value: dashboardData.users?.filter(user => user.isActive)?.length || 0, 
            icon: <FiUsers className="w-6 h-6" />, 
            color: 'bg-[#4F959D]',
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
            data={lineChartData} 
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
                <div className="w-2 h-2 rounded-full bg-[#205781] mr-4"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Employee Management Card */}
        <Link href="/employee-management" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-[#F6F8D5] text-[#205781]">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="ml-4 text-xl font-semibold text-gray-800">Employee Management</h3>
          </div>
          <p className="text-gray-600">Manage employees, attendance, leaves, and calculate salaries.</p>
        </Link>

        {/* Create Employee User Card */}
        <Link href="/create-employee-user" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-[#F6F8D5] text-[#4F959D]">
              <FiUserPlus className="w-6 h-6" />
            </div>
            <h3 className="ml-4 text-xl font-semibold text-gray-800">Create Employee Account</h3>
          </div>
          <p className="text-gray-600">Create a new employee with login access in one step.</p>
        </Link>
        
        {/* User Management Card */}
        <Link href="/user-management" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-[#F6F8D5] text-[#98D2C0]">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="ml-4 text-xl font-semibold text-gray-800">User Management</h3>
          </div>
          <p className="text-gray-600">Manage user accounts, roles, and permissions.</p>
        </Link>
        
        {/* ... other cards ... */}
      </div>
    </div>
  );

  const AnalyticsContent = () => (
    <div className="space-y-6">
      {!analyticsData ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F959D]"></div>
        </div>
      ) : Object.keys(analyticsData.currentMetrics || {}).length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No analytics data available. Please make sure there are appointments in the system.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData.currentMetrics).map(([branch, data]) => (
              <div key={branch} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium text-gray-900">{branch}</h3>
                <p className="text-2xl font-bold text-[#4F959D] mt-2">{data.total}</p>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-sm text-[#205781] mt-2">
                  Prediction: {analyticsData.predictions[branch]?.total || 0} next month
                </p>
              </div>
            ))}
          </div>

          <BranchAnalytics 
            branchMetrics={analyticsData.currentMetrics} 
            predictions={analyticsData.predictions} 
          />
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "analytics":
        return <AnalyticsContent />;
      case "user":
        return <UserManagement />;
      case "employee":
        return <EmployeeManagement />;
      case "pet":
        return <PetManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "appointment":
        return <AppointmentManagement />;
      case "forum":
        return <ForumManagement />;
      case "supplier":
        return <SupplierManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#F6F8D5] shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center justify-between p-4 border-b bg-[#4F959D]">
            {isSidebarOpen && (
              <div className="flex items-center">
                <MdPets className="w-8 h-8 text-white" />
                <h1 className="text-xl font-bold text-white ml-2">PetCare</h1>
              </div>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#205781] text-white"
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
                        ? 'bg-[#4F959D] text-white shadow-md transform scale-105' 
                        : 'text-gray-600 hover:bg-[#98D2C0]/30'
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
          <div className="p-4 border-t border-[#4F959D]/20">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-600 hover:bg-[#98D2C0]/30 hover:text-[#205781] rounded-lg transition-all duration-200"
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
        <header className="bg-[#F6F8D5] shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#4F959D] flex items-center justify-center text-white">
                  A
                </div>
                <span className="text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8 overflow-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
