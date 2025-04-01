import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define constants for pet types
const DEFAULT_PET_TYPES = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Unknown'];

const BranchAnalytics = ({ branchMetrics = {}, predictions = {} }) => {
  const [petTypePredictions, setPetTypePredictions] = useState({
    byPetType: {},
    byBranch: {}
  });
  const [loadingPetTypePredictions, setLoadingPetTypePredictions] = useState(true);
  const [petTypePredictionError, setPetTypePredictionError] = useState(null);

  // Fetch pet type predictions when component mounts
  const fetchPetTypePredictions = async () => {
    try {
      setLoadingPetTypePredictions(true);
      
      // Increase timeout to 60 seconds (1 minute) since the first prediction calculation takes the longest
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out - the prediction process is taking longer than expected')), 60000)
      );
      
      // Use the correct API URL with http://localhost:8080 prefix
      const fetchPromise = fetch('http://localhost:8080/api/analytics/pet-type-predictions');
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Handle 404 error explicitly for clearer error messaging
      if (response.status === 404) {
        throw new Error('Endpoint not found. The pet type predictions API may not be properly configured.');
      }
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Pet type predictions data:', data);
      
      // Validate the data structure
      if (!data.byBranch || Object.keys(data.byBranch).length === 0) {
        throw new Error('Invalid data format received from server');
      }
      
      setPetTypePredictions(data);
      setLoadingPetTypePredictions(false);
      setPetTypePredictionError(null);
    } catch (error) {
      console.error('Error fetching pet type predictions:', error);
      
      // Set a more user-friendly message for timeout errors
      if (error.message.includes('timed out')) {
        setPetTypePredictionError(
          'The prediction calculations are taking too long. Using estimated data instead. Future visits will be faster due to caching.'
        );
      } else {
        setPetTypePredictionError(error.message);
      }
      
      setLoadingPetTypePredictions(false);
      
      // Generate fallback predictions
      if (Object.keys(branchMetrics).length > 0) {
        generateFallbackPredictions();
      }
    }
  };

  // Generate fallback pet type predictions based on current metrics
  const generateFallbackPredictions = () => {
    const fallbackData = {
      byPetType: {},
      byBranch: {}
    };
    
    // Initialize for each branch
    branches.forEach(branch => {
      fallbackData.byBranch[branch] = {
        branchName: branch,
        petTypes: {}
      };
      
      // Calculate total predicted count (simple estimate based on current data)
      const total = branchMetrics[branch].total;
      const monthlyEstimate = Math.ceil(total / 3); // Divide by 3 for a modest monthly estimate
      
      // Distribute by pet type based on current distribution
      petTypes.forEach(type => {
        const currentCount = branchMetrics[branch].petTypeStats[type] || 0;
        const proportion = total > 0 ? currentCount / total : 0.2;
        const predictedCount = Math.max(1, Math.round(monthlyEstimate * proportion));
        
        // Add to branch
        fallbackData.byBranch[branch].petTypes[type] = predictedCount;
        
        // Initialize pet type entry if needed
        if (!fallbackData.byPetType[type]) {
          fallbackData.byPetType[type] = {
            total: 0,
            byBranch: {}
          };
        }
        
        // Add to pet type
        fallbackData.byPetType[type].byBranch[branch] = predictedCount;
        fallbackData.byPetType[type].total = 
          (fallbackData.byPetType[type].total || 0) + predictedCount;
      });
    });
    
    // Use the fallback data
    setPetTypePredictions(fallbackData);
    setLoadingPetTypePredictions(false);
    // Keep the error message but show fallback data
  };

  useEffect(() => {
    fetchPetTypePredictions();
  }, [branchMetrics, branches, petTypes]);

  // Check if we have valid data to render
  const hasData = Object.keys(branchMetrics).length > 0;
  
  // If no data is available, show a nicer message
  if (!hasData) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Analytics Dashboard</h3>
          <p className="text-gray-500 mb-4">No analytics data available. Please make sure there are appointments in the system.</p>
          <p className="text-sm text-gray-400 max-w-md">Once appointments are added, AI-powered predictions will appear here to help forecast future appointment trends.</p>
        </div>
      </div>
    );
  }
  
  const branches = Object.keys(branchMetrics);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const petTypes = DEFAULT_PET_TYPES;
  
  // Modern color palette
  const modernColors = {
    primary: 'rgba(79, 70, 229, 1)',    // Indigo
    secondary: 'rgba(16, 185, 129, 1)', // Emerald
    accent: 'rgba(245, 158, 11, 1)',    // Amber
    neutral: 'rgba(107, 114, 128, 1)',  // Gray
    info: 'rgba(59, 130, 246, 1)',      // Blue
    success: 'rgba(5, 150, 105, 1)',    // Green
    warning: 'rgba(217, 119, 6, 1)',    // Yellow
    danger: 'rgba(220, 38, 38, 1)',     // Red
    light: 'rgba(243, 244, 246, 1)',    // Light Gray
    dark: 'rgba(31, 41, 55, 1)',        // Dark Gray
  };
  
  // Updated colors for pet types
  const typeColors = {
    'Dog': 'rgba(79, 70, 229, 0.8)',    // Indigo
    'Cat': 'rgba(16, 185, 129, 0.8)',   // Emerald
    'Bird': 'rgba(245, 158, 11, 0.8)',  // Amber
    'Fish': 'rgba(59, 130, 246, 0.8)',  // Blue
    'Rabbit': 'rgba(5, 150, 105, 0.8)', // Green
    'Unknown': 'rgba(107, 114, 128, 0.8)' // Gray
  };
  
  const typeColorsRGB = {
    'Dog': '79, 70, 229',      // Indigo
    'Cat': '16, 185, 129',     // Emerald
    'Bird': '245, 158, 11',    // Amber
    'Fish': '59, 130, 246',    // Blue
    'Rabbit': '5, 150, 105',   // Green
    'Unknown': '107, 114, 128' // Gray
  };

  // Ensure all branches have predictions and pet type stats
  branches.forEach(branch => {
    if (!predictions[branch]) {
      predictions[branch] = {
        total: 0,
        byPetType: {},
        mostPopularType: 'Unknown'
      };
    }
    
    // Ensure each branch has petTypeStats
    if (!branchMetrics[branch].petTypeStats) {
      branchMetrics[branch].petTypeStats = {};
    }
    
    // Ensure each pet type has byPetType entry
    if (!predictions[branch].byPetType) {
      predictions[branch].byPetType = {};
    }
    
    // Set default for any missing pet types
    petTypes.forEach(type => {
      if (!branchMetrics[branch].petTypeStats[type]) {
        branchMetrics[branch].petTypeStats[type] = 0;
      }
      if (!predictions[branch].byPetType[type]) {
        predictions[branch].byPetType[type] = 0;
      }
    });
  });

  // Modern chart options with improved styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          padding: 20,
          color: '#4B5563' // Gray-600
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)', // Gray-900 with opacity
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif',
          weight: '600'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif'
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 5,
        callbacks: {
          // Add callback to add the word "Predicted" to prediction values
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
              if (context.dataset.isPrediction) {
                label += ' (AI Predicted)';
              }
            }
            return label;
          }
        }
      },
      title: {
        display: false,
        font: {
          size: 16,
          family: 'Inter, sans-serif',
          weight: '600'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280', // Gray-500
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          padding: 8
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6B7280', // Gray-500
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          padding: 8
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  // Pet types by branch chart - current data
  const petTypesData = {
    labels: branches,
    datasets: petTypes.map((type) => ({
      label: type,
      data: branches.map(branch => branchMetrics[branch]?.petTypeStats?.[type] || 0),
      backgroundColor: typeColors[type],
      borderColor: typeColors[type].replace('0.8', '1.0'),
      borderWidth: 1,
      borderRadius: 4,
      isPrediction: false
    }))
  };

  // Next month predictions by branch
  const predictionsByBranch = {
    labels: branches,
    datasets: [{
      label: 'AI Predicted Appointments',
      data: branches.map(branch => predictions[branch]?.total || 0),
      backgroundColor: 'rgba(79, 70, 229, 0.7)', // Indigo with opacity
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 1,
      borderRadius: 4,
      isPrediction: true
    }]
  };

  // Most popular pet types doughnut chart data
  const popularTypesData = {
    labels: petTypes.filter(type => 
      branches.reduce((total, branch) => 
        total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
    ),
    datasets: [{
      data: petTypes.map(type => 
        branches.reduce((total, branch) => 
          total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0)
      ).filter(val => val > 0),
      backgroundColor: petTypes.filter(type => 
        branches.reduce((total, branch) => 
          total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
      ).map(type => typeColors[type]),
      borderColor: petTypes.filter(type => 
        branches.reduce((total, branch) => 
          total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
      ).map(type => typeColors[type].replace('0.8', '1.0')),
      borderWidth: 1,
      cutout: '70%',
      isPrediction: false
    }]
  };

  // Calculate total appointments and total predictions
  const totalAppointments = branches.reduce(
    (sum, branch) => sum + branchMetrics[branch].total, 0
  );
  
  const totalPredictions = branches.reduce(
    (sum, branch) => sum + (predictions[branch]?.total || 0), 0
  );

  // Calculate total pet type predictions
  const totalPetTypePredictions = Object.values(petTypePredictions).reduce(
    (sum, prediction) => sum + (prediction.total || 0), 0
  );

  return (
    <div>
      {/* Header with summary stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white text-opacity-80 text-sm font-medium">Total Appointments</h4>
              <p className="text-3xl font-bold mt-1">{totalAppointments}</p>
              <p className="text-xs text-white text-opacity-80 mt-1">Across all branches</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white text-opacity-80 text-sm font-medium">AI Predicted (Next Month)</h4>
              <p className="text-3xl font-bold mt-1">{totalPredictions}</p>
              <p className="text-xs text-white text-opacity-80 mt-1">Using machine learning</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white text-opacity-80 text-sm font-medium">Branches</h4>
              <p className="text-3xl font-bold mt-1">{branches.length}</p>
              <p className="text-xs text-white text-opacity-80 mt-1">Active locations</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white text-opacity-80 text-sm font-medium">Growth Rate</h4>
              <p className="text-3xl font-bold mt-1">
                {totalAppointments > 0 && totalPredictions > 0 
                  ? Math.round((totalPredictions * 12 / totalAppointments - 1) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-white text-opacity-80 mt-1">Projected annual</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Prediction Summary Card */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">AI Predictions by Branch</h3>
              <p className="text-xs text-gray-500">Forecast for next month using machine learning</p>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar data={predictionsByBranch} options={chartOptions} />
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-2 gap-4 content-start">
          {branches.map(branch => {
            const totalCount = branchMetrics[branch].total || 0;
            const predictedCount = predictions[branch]?.total || 0;
            const growthRate = totalCount > 0 
              ? Math.round((predictedCount * 12 / totalCount - 1) * 100) 
              : 0;
            const mostPopularType = predictions[branch]?.mostPopularType || 'Unknown';
            
            // Find the actual most popular pet type from current metrics
            let currentMostPopularType = 'Unknown';
            let maxTypeCount = 0;
            Object.entries(branchMetrics[branch]?.petTypeStats || {}).forEach(([type, count]) => {
              if (count > maxTypeCount) {
                maxTypeCount = count;
                currentMostPopularType = type;
              }
            });
            
            return (
              <div key={branch} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-500">{branch}</h4>
                  <div className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-800">
                    {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
                  </div>
                </div>
                <div className="flex items-end mb-3">
                  <div className="text-2xl font-bold">{predictedCount}</div>
                  <div className="text-xs text-gray-500 ml-2 mb-1">predicted next month</div>
                </div>
                
                {/* Most Popular Pet Type Card with Icon */}
                <div className="bg-gray-50 p-2 rounded-lg mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Pet Type Icon - Customize based on pet type */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" 
                          style={{ backgroundColor: typeColors[currentMostPopularType] }}>
                        {currentMostPopularType === 'Dog' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-1.218 2.435a2 2 0 01-1.788 1.105H15m1-7l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )}
                        {currentMostPopularType === 'Cat' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                          </svg>
                        )}
                        {(currentMostPopularType !== 'Dog' && currentMostPopularType !== 'Cat') && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Most Popular</p>
                        <p className="text-sm font-medium">{currentMostPopularType}</p>
                      </div>
                    </div>
                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                      {branchMetrics[branch]?.petTypeStats?.[currentMostPopularType] || 0}
                    </div>
                  </div>
                </div>
                
                {/* Only show Predicted Most Popular Pet Type if there's actual data */}
                {predictions[branch]?.byPetType && 
                 Object.values(predictions[branch]?.byPetType).some(count => count > 0) && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: typeColors[mostPopularType] }}></div>
                        <span className="text-xs font-medium">Predicted popular: {mostPopularType}</span>
                      </div>
                      <div className="text-xs font-medium">
                        {predictions[branch]?.byPetType?.[mostPopularType] || 0}
                      </div>
                    </div>
                    
                    {/* Progress bars for pet types */}
                    <div className="mt-3 space-y-2">
                      {Object.entries(predictions[branch]?.byPetType || {})
                        .filter(([type, count]) => count > 0)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .slice(0, 3)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center">
                            <div className="text-xs w-14 font-medium truncate mr-2">{type}</div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mr-2">
                              <div 
                                className="h-1.5 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, (count / predictedCount) * 100)}%`,
                                  backgroundColor: typeColors[type]
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pet Types Distribution */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Pet Type Distribution</h3>
              <p className="text-xs text-gray-500">Interactive visualization showing pet types across all branches</p>
            </div>
          </div>
          
          <div className="h-[350px]">
            <Bar 
              data={{
                labels: petTypes.filter(type => 
                  branches.reduce((total, branch) => 
                    total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
                ),
                datasets: [{
                  data: petTypes.filter(type => 
                    branches.reduce((total, branch) => 
                      total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
                  ).map(type => 
                    branches.reduce((total, branch) => 
                      total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0)
                  ),
                  backgroundColor: petTypes.filter(type => 
                    branches.reduce((total, branch) => 
                      total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
                  ).map(type => typeColors[type]),
                  borderColor: petTypes.filter(type => 
                    branches.reduce((total, branch) => 
                      total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
                  ).map(type => typeColors[type].replace('0.8', '1.0')),
                  borderWidth: 1,
                  borderRadius: 6,
                  barThickness: 25,
                  maxBarThickness: 35,
                  minBarLength: 5
                }]
              }}
              options={{
                ...chartOptions,
                indexAxis: 'y',
                plugins: {
                  ...chartOptions.plugins,
                  legend: { 
                    display: false 
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} appointments (${percentage}%)`;
                      },
                      title: function() {
                        return 'Pet Type Details';
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: 'Current Pet Type Distribution',
                    font: {
                      size: 16,
                      family: 'Inter, sans-serif',
                      weight: '600'
                    },
                    padding: {
                      top: 10,
                      bottom: 20
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif',
                        size: 11
                      }
                    },
                    title: {
                      display: true,
                      text: 'Number of Appointments',
                      font: {
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif',
                        weight: 'bold',
                        size: 12
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          {/* Branch Distribution Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Type</th>
                  {branches.map(branch => (
                    <th key={branch} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {branch.replace(' Branch', '')}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {petTypes.filter(type => 
                  branches.reduce((total, branch) => 
                    total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0) > 0
                ).map((type, index) => {
                  const total = branches.reduce((total, branch) => 
                    total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0);
                  const percentage = ((total / totalAppointments) * 100).toFixed(1);
                  
                  return (
                    <tr key={type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: typeColors[type] }}
                          ></div>
                          <span className="font-medium">{type}</span>
                        </div>
                      </td>
                      {branches.map(branch => (
                        <td key={`${type}-${branch}`} className="px-4 py-3 whitespace-nowrap">
                          {branchMetrics[branch]?.petTypeStats?.[type] || 0}
                        </td>
                      ))}
                      <td className="px-4 py-3 whitespace-nowrap font-bold">{total}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `rgba(${typeColorsRGB[type]}, 0.1)` }}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Next Month Pet Type Predictions */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">AI Predictions by Pet Type</h3>
                <p className="text-xs text-gray-500">Expected appointment counts by branch for next month</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setLoadingPetTypePredictions(true);
                fetchPetTypePredictions();
              }} 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Chart
            </button>
          </div>
          
          {/* Show warning when using fallback data */}
          {petTypePredictionError && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-sm flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">Using estimated data</p>
                <p className="text-xs mt-1">
                  {petTypePredictionError.includes('timed out') 
                    ? 'The AI predictions are still being calculated on the server (takes ~1 minute for first load). You can use the estimated data or:'
                    : `Could not fetch AI predictions: ${petTypePredictionError}. Showing estimates based on current appointments.`
                  }
                </p>
                {petTypePredictionError.includes('timed out') && (
                  <button 
                    onClick={() => {
                      setLoadingPetTypePredictions(true);
                      fetchPetTypePredictions();
                    }} 
                    className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-md transition-colors"
                  >
                    Refresh Chart
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="h-[300px]">
            {loadingPetTypePredictions ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-sm text-gray-600">Generating AI predictions...</p>
                <p className="text-xs text-gray-500 mt-1 max-w-md text-center">
                  This may take up to 60 seconds as our system analyzes historical data and creates predictions for each pet type.
                </p>
              </div>
            ) : petTypePredictionError && (!petTypePredictions.byBranch || Object.keys(petTypePredictions.byBranch).length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Error loading pet type predictions</p>
                <p className="text-xs text-gray-400 mt-1">{petTypePredictionError}</p>
              </div>
            ) : !petTypePredictions.byBranch || Object.keys(petTypePredictions.byBranch).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm">No pet type prediction data available</p>
              </div>
            ) : (
              <Bar 
                data={{
                  labels: DEFAULT_PET_TYPES.filter(type => 
                    // Check if any branch has this pet type with non-zero predictions
                    Object.values(petTypePredictions.byBranch).some(branch => 
                      branch.petTypes && branch.petTypes[type] && branch.petTypes[type] > 0
                    )
                  ),
                  datasets: branches.map((branch, index) => {
                    const branchData = petTypePredictions.byBranch[branch] || { petTypes: {} };
                    return {
                      label: branch,
                      data: DEFAULT_PET_TYPES.filter(type => 
                        Object.values(petTypePredictions.byBranch).some(branch => 
                          branch.petTypes && branch.petTypes[type] && branch.petTypes[type] > 0
                        )
                      ).map(type => (branchData.petTypes && branchData.petTypes[type]) || 0),
                      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.7)`,
                      borderColor: `hsla(${index * 60}, 70%, 50%, 1)`,
                      borderWidth: 1,
                      borderRadius: 4,
                      isPrediction: true
                    };
                  })
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      title: {
                        display: true,
                        text: 'Pet Types',
                        font: {
                          weight: 'bold',
                          size: 14
                        }
                      }
                    },
                    y: {
                      ...chartOptions.scales.y,
                      title: {
                        display: true,
                        text: 'Predicted Appointments',
                        font: {
                          weight: 'bold',
                          size: 14
                        }
                      }
                    }
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: 'AI Predicted Appointments by Pet Type and Branch',
                      font: {
                        size: 16,
                        family: 'Inter, sans-serif',
                        weight: '600'
                      },
                      padding: {
                        top: 10,
                        bottom: 20
                      }
                    },
                    tooltip: {
                      ...chartOptions.plugins.tooltip,
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += context.parsed.y + ' predicted appointments';
                          }
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
          
          {/* Prediction Summary Table */}
          {!loadingPetTypePredictions && !petTypePredictionError && 
           petTypePredictions.byBranch && Object.keys(petTypePredictions.byBranch).length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    {DEFAULT_PET_TYPES.filter(type => 
                      Object.values(petTypePredictions.byBranch).some(branch => 
                        branch.petTypes && branch.petTypes[type] && branch.petTypes[type] > 0
                      )
                    ).map(type => (
                      <th key={type} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {type}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {branches.map((branch, index) => {
                    const branchData = petTypePredictions.byBranch[branch] || { petTypes: {} };
                    const petTypesWithData = DEFAULT_PET_TYPES.filter(type => 
                      Object.values(petTypePredictions.byBranch).some(branch => 
                        branch.petTypes && branch.petTypes[type] && branch.petTypes[type] > 0
                      )
                    );
                    
                    const total = petTypesWithData.reduce((sum, type) => 
                      sum + ((branchData.petTypes && branchData.petTypes[type]) || 0), 0
                    );
                    
                    return (
                      <tr key={branch} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{branch}</td>
                        {petTypesWithData.map(type => (
                          <td key={`${branch}-${type}`} className="px-4 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center">
                              <span 
                                className="w-2 h-2 rounded-full mr-2" 
                                style={{ backgroundColor: typeColors[type] }}
                              ></span>
                              {(branchData.petTypes && branchData.petTypes[type]) || 0}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-2 whitespace-nowrap font-semibold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Monthly Booking Trends */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Monthly Booking Trends</h3>
              <p className="text-xs text-gray-500">Historical appointment data by branch</p>
            </div>
          </div>
          <div className="h-[400px]">
            <Line 
              data={{
                labels: months,
                datasets: branches.map((branch, index) => ({
                  label: branch,
                  data: branchMetrics[branch]?.monthly || Array(12).fill(0),
                  borderColor: `hsla(${index * 60}, 70%, 50%, 1)`,
                  backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: `hsla(${index * 60}, 70%, 50%, 1)`,
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  borderWidth: 3
                }))
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { position: 'bottom' }
                },
                elements: {
                  line: {
                    tension: 0.4
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer note about AI */}
      <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-indigo-700 font-medium">About AI Predictions</p>
            <p className="text-xs text-indigo-600 mt-1">
              These predictions are generated using Facebook Prophet, a time series forecasting algorithm. 
              Prediction accuracy depends on historical data quality and quantity. As more appointment data 
              is collected, predictions will become increasingly accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchAnalytics;
