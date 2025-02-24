const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const forumController = require('../controllers/forumController');

// Public routes (no authentication required)
router.get('/posts', forumController.getAllPosts);
router.get('/posts/:postId', forumController.getPost);

// Protected routes (authentication required)
router.post('/posts', authMiddleware.protect, forumController.createPost);
router.post('/posts/:postId/reply', authMiddleware.protect, forumController.addReply);
router.post('/posts/:postId/like', authMiddleware.protect, forumController.toggleLike);
router.delete('/posts/:postId', authMiddleware.protect, forumController.deletePost);

module.exports = router;
