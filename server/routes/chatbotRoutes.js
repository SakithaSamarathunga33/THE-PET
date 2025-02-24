const express = require('express');
const router = express.Router();
const { handleChatbotQuery } = require('../controllers/chatbotController');

// Public chatbot route - no authentication required
router.post('/', handleChatbotQuery);

module.exports = router;
