const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');  // Remove adminOnly for testing
const { getBranchAnalytics } = require('../../controllers/analyticsController');

// Temporarily remove adminOnly middleware for testing
router.get('/branch', protect, getBranchAnalytics);

module.exports = router;
