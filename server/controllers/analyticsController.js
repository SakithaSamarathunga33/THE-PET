const { calculateBranchMetrics, predictNextMonthBookings } = require('../services/analyticsService');

exports.getBranchAnalytics = async (req, res) => {
  try {
    const branchMetrics = await calculateBranchMetrics();

    if (Object.keys(branchMetrics).length === 0) {
      return res.json({
        currentMetrics: {
          'Colombo Branch': { total: 0, monthly: Array(12).fill(0) },
          'Kandy Branch': { total: 0, monthly: Array(12).fill(0) },
          'Galle Branch': { total: 0, monthly: Array(12).fill(0) },
          'Jaffna Branch': { total: 0, monthly: Array(12).fill(0) }
        },
        predictions: {
          'Colombo Branch': { total: 0, byPetName: {} },
          'Kandy Branch': { total: 0, byPetName: {} },
          'Galle Branch': { total: 0, byPetName: {} },
          'Jaffna Branch': { total: 0, byPetName: {} }
        }
      });
    }

    const predictions = predictNextMonthBookings(branchMetrics);
    
    res.json({
      currentMetrics: branchMetrics,
      predictions: predictions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating analytics' });
  }
};
