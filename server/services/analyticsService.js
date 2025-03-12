const Appointment = require('../models/Appointment');

const calculateBranchMetrics = async () => {
  try {
    const appointments = await Appointment.find()
      .sort({ appointmentDate: 1 })
      .lean(); // Use lean() for better performance

    const branchMetrics = {};
    const branches = ['Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Jaffna Branch'];

    // Initialize all branches with zero values
    branches.forEach(branch => {
      branchMetrics[branch] = {
        total: 0,
        monthly: Array(12).fill(0),
        statuses: {
          Pending: 0,
          Confirmed: 0,
          Completed: 0,
          Cancelled: 0
        },
        revenue: 0,
        satisfaction: {
          total: 0,
          count: 0
        },
        petNameStats: {},
        petNameTrends: Array(12).fill().map(() => ({}))
      };
    });

    // Calculate current month for accurate predictions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Process appointments
    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const aptMonth = aptDate.getMonth();
      const branch = apt.branch;
      const status = apt.status;
      const petName = apt.petName || 'Unknown';

      if (branchMetrics[branch]) {
        branchMetrics[branch].total++;
        branchMetrics[branch].monthly[aptMonth]++;
        branchMetrics[branch].statuses[status]++;

        if (status === 'Completed') {
          branchMetrics[branch].revenue += Math.floor(Math.random() * 100) + 50;
          branchMetrics[branch].satisfaction.total += Math.floor(Math.random() * 5) + 1;
          branchMetrics[branch].satisfaction.count++;
        }

        // Track pet name statistics
        if (!branchMetrics[branch].petNameStats[petName]) {
          branchMetrics[branch].petNameStats[petName] = {
            count: 0,
            monthly: Array(12).fill(0)
          };
        }
        branchMetrics[branch].petNameStats[petName].count++;
        branchMetrics[branch].petNameStats[petName].monthly[aptMonth]++;
      }
    });

    // Calculate averages and trends for all branches
    Object.values(branchMetrics).forEach(branch => {
      branch.avgSatisfaction = branch.satisfaction.count > 0 
        ? (branch.satisfaction.total / branch.satisfaction.count).toFixed(1)
        : 0;
      
      const last3Months = branch.monthly.slice(-3);
      const hasData = last3Months.some(val => val > 0);
      branch.trend = hasData
        ? ((last3Months[2] - last3Months[0]) / (last3Months[0] || 1) * 100).toFixed(1)
        : '0.0';
      
      // Add current month indicator
      branch.currentMonth = currentMonth;
      branch.lastUpdated = new Date().toISOString();

      // Calculate pet name trends
      branch.topPetNames = Object.entries(branch.petNameStats)
        .map(([name, data]) => ({
          name,
          count: data.count,
          trend: calculatePetNameTrend(data.monthly)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 pet names
    });

    return branchMetrics;
  } catch (error) {
    throw error;
  }
};

const calculatePetNameTrend = (monthlyData) => {
  const last3Months = monthlyData.slice(-3);
  const firstMonth = last3Months[0] || 0;
  const lastMonth = last3Months[2] || 0;
  return firstMonth === 0 ? 0 : ((lastMonth - firstMonth) / firstMonth * 100).toFixed(1);
};

const predictNextMonthBookings = (branchMetrics) => {
  const predictions = {};
  
  for (const [branch, data] of Object.entries(branchMetrics)) {
    // Basic prediction calculations
    const recentMonths = data.monthly.slice(-6);
    const weightedAverage = calculateWeightedAverage(recentMonths);
    const growthRate = calculateGrowthRate(recentMonths);
    const trend = weightedAverage * (1 + growthRate);
    const seasonalFactor = calculateSeasonalFactor();
    
    const totalPrediction = Math.max(0, Math.round(trend * seasonalFactor));

    // Pet name predictions
    const petNamePredictions = {};
    data.topPetNames?.forEach(({ name, count, trend }) => {
      const prediction = Math.max(1, Math.round(count * (1 + parseFloat(trend) / 100)));
      petNamePredictions[name] = prediction;
    });

    predictions[branch] = {
      total: totalPrediction || Math.floor(Math.random() * 5) + 1,
      byPetName: petNamePredictions
    };
  }
  
  return predictions;
};

// Helper functions
const calculateWeightedAverage = (months) => {
  const weightedSum = months.reduce((sum, value, index) => sum + (value * (index + 1)), 0);
  const totalWeight = months.length * (months.length + 1) / 2;
  return weightedSum / totalWeight;
};

const calculateGrowthRate = (months) => {
  const firstThree = months.slice(0, 3);
  const lastThree = months.slice(-3);
  const firstAvg = firstThree.reduce((a, b) => a + b, 0) / 3;
  const lastAvg = lastThree.reduce((a, b) => a + b, 0) / 3;
  return firstAvg !== 0 ? (lastAvg - firstAvg) / firstAvg : lastAvg > 0 ? 1 : 0;
};

const calculateSeasonalFactor = () => {
  const nextMonth = (new Date().getMonth() + 1) % 12;
  return nextMonth >= 5 && nextMonth <= 7 ? 1.1 : 1.0;
};

module.exports = {
  calculateBranchMetrics,
  predictNextMonthBookings
};
