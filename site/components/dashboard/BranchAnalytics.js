import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
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
  Legend
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
  Legend
);

const BranchAnalytics = ({ branchMetrics = {}, predictions = {} }) => {
  const branches = Object.keys(branchMetrics);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'];
  const typeColors = {
    'Dog': 'hsla(0, 70%, 50%, 0.7)',
    'Cat': 'hsla(60, 70%, 50%, 0.7)',
    'Bird': 'hsla(120, 70%, 50%, 0.7)',
    'Fish': 'hsla(180, 70%, 50%, 0.7)',
    'Rabbit': 'hsla(240, 70%, 50%, 0.7)',
    'Unknown': 'hsla(300, 70%, 50%, 0.7)'
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Pet types by branch chart
  const petTypesData = {
    labels: branches,
    datasets: petTypes.map((type, index) => ({
      label: type,
      data: branches.map(branch => branchMetrics[branch]?.petTypeStats?.[type] || 0),
      backgroundColor: typeColors[type],
      borderColor: typeColors[type].replace('0.7', '1.0'),
      borderWidth: 2,
      borderRadius: 5,
    }))
  };

  // Pet type predictions chart
  const petTypePredictionsData = {
    labels: branches,
    datasets: petTypes.map((type, index) => ({
      label: type,
      data: branches.map(branch => predictions[branch]?.byPetType?.[type] || 0),
      backgroundColor: typeColors[type],
      borderColor: typeColors[type].replace('0.7', '1.0'),
      borderWidth: 2,
      borderRadius: 5,
    }))
  };

  // Next month predictions by branch
  const predictionsByBranch = {
    labels: branches,
    datasets: [{
      label: 'Predicted Appointments',
      data: branches.map(branch => predictions[branch]?.total || 0),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 2,
      borderRadius: 5,
    }]
  };

  // Most popular pet types pie chart data
  const popularTypesData = {
    labels: petTypes,
    datasets: [{
      data: petTypes.map(type => 
        branches.reduce((total, branch) => 
          total + (branchMetrics[branch]?.petTypeStats?.[type] || 0), 0)
      ),
      backgroundColor: petTypes.map(type => typeColors[type]),
      borderColor: petTypes.map(type => typeColors[type].replace('0.7', '1.0')),
      borderWidth: 1,
    }]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Pet Types by Branch
        </h3>
        <div className="h-[300px]">
          <Bar data={petTypesData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Next Month Predictions by Pet Type
        </h3>
        <div className="h-[300px]">
          <Bar data={petTypePredictionsData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Total Predicted Appointments by Branch
        </h3>
        <div className="h-[300px]">
          <Bar data={predictionsByBranch} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Most Popular Pet Types Overall
        </h3>
        <div className="h-[300px]">
          <Pie data={popularTypesData} options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: { position: 'right' }
            }
          }} />
        </div>
      </div>

      {/* Pet Booking Trends by Branch */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Pet Booking Trends by Branch
        </h3>
        <div className="h-[400px]">
          <Line 
            data={{
              labels: months,
              datasets: branches.map((branch, index) => ({
                label: branch,
                data: branchMetrics[branch]?.monthly || Array(12).fill(0),
                borderColor: `hsl(${index * 90}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 90}, 70%, 50%, 0.1)`,
                tension: 0.3,
                fill: true,
              }))
            }}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>

      {/* Branch Prediction Cards */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        {branches.map(branch => {
          const mostPopularType = predictions[branch]?.mostPopularType || 'Unknown';
          return (
            <div key={branch} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500">{branch} Predictions</h4>
              <div className="mt-2">
                <div className="text-lg font-bold">{predictions[branch]?.total || 0}</div>
                <div className="text-sm text-gray-600">Expected appointments next month</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: typeColors[mostPopularType] }}></div>
                  <span className="text-sm">Most popular: {mostPopularType}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Expected: {predictions[branch]?.byPetType?.[mostPopularType] || 0} appointments
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BranchAnalytics;
