import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
);

const BranchAnalytics = ({ branchMetrics = {}, predictions = {} }) => {
  const branches = Object.keys(branchMetrics);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

  // Top pets by branch chart
  const topPetsData = {
    labels: branches,
    datasets: branches.reduce((acc, branch) => {
      const topPets = branchMetrics[branch]?.topPetNames || [];
      topPets.forEach(({ name, count }, index) => {
        if (!acc.find(d => d.label === name)) {
          acc.push({
            label: name,
            data: branches.map(b => 
              branchMetrics[b]?.topPetNames?.find(p => p.name === name)?.count || 0
            ),
            backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.5)`,
            borderColor: `hsl(${index * 60}, 70%, 50%)`,
            borderWidth: 2,
            borderRadius: 5,
          });
        }
      });
      return acc;
    }, [])
  };

  // Pet name predictions chart
  const petPredictionsData = {
    labels: branches,
    datasets: branches.reduce((acc, branch) => {
      const petPredictions = predictions[branch]?.byPetName || {};
      Object.entries(petPredictions).forEach(([name, value], index) => {
        if (!acc.find(d => d.label === name)) {
          acc.push({
            label: name,
            data: branches.map(b => predictions[b]?.byPetName?.[name] || 0),
            backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.5)`,
            borderColor: `hsl(${index * 60}, 70%, 50%)`,
            borderWidth: 2,
            borderRadius: 5,
          });
        }
      });
      return acc;
    }, [])
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Popular Pets by Branch
        </h3>
        <div className="h-[300px]">
          <Bar data={topPetsData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Pet Name Predictions
        </h3>
        <div className="h-[300px]">
          <Bar data={petPredictionsData} options={chartOptions} />
        </div>
      </div>

      {/* Pet Names Monthly Trends */}
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
                data: branchMetrics[branch].monthly,
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

      {/* Pet Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        {branches.map(branch => (
          <div key={branch} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-500">Top Pets - {branch}</h4>
            <div className="mt-2 space-y-2">
              {(branchMetrics[branch]?.topPetNames || []).map(({ name, count, trend }) => (
                <div key={name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{count}</span>
                    <span className={`text-xs ${parseFloat(trend) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(trend) > 0 ? '+' : ''}{trend}%
                    </span>
                  </div>
                </div>
              ))}
              {(!branchMetrics[branch]?.topPetNames?.length) && (
                <div className="text-sm text-gray-500">No pet data available</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchAnalytics;
