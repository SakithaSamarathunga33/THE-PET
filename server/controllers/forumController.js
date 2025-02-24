const ForumPost = require('../models/forumPost');
const User = require('../models/user');

// List of inappropriate words and phrases to filter
const inappropriateContent = [
    // Add inappropriate words here
    'sex', 'violence', 'kill', 'nsfw', 'xxx',
    // Add more words as needed
];

// Content moderation function
const moderateContent = (text) => {
    const lowerText = text.toLowerCase();
    return inappropriateContent.some(word => lowerText.includes(word.toLowerCase()));
};

// Get all posts (public access)
const getAllPosts = async (req, res) => {
    try {
        const posts = await ForumPost.find()
            .populate('author', 'name email')
            .populate('replies.author', 'name email')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create new post (authenticated users only)
const createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;

        // Check for inappropriate content
        if (moderateContent(title) || moderateContent(content)) {
            return res.status(400).json({
                message: 'Your post contains inappropriate content. Please revise and try again.'
            });
        }

        const post = new ForumPost({
            title,
            content,
            category,
            tags,
            author: req.user._id
        });

        await post.save();

        const populatedPost = await post.populate('author', 'name username');

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add reply to post (authenticated users only)
const addReply = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;

        // Check for inappropriate content
        if (moderateContent(content)) {
            return res.status(400).json({
                message: 'Your reply contains inappropriate content. Please revise and try again.'
            });
        }

        const post = await ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.replies.push({
            content,
            author: req.user._id
        });

        await post.save();
        
        const updatedPost = await post.populate('replies.author', 'name username');
        res.json(updatedPost);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like/Unlike post (authenticated users only)
const toggleLike = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;

        const post = await ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1); // Unlike
        } else {
            post.likes.push(userId); // Like
        }

        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single post with replies (public access)
const getPost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.postId)
            .populate('author', 'name email')
            .populate('replies.author', 'name email');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete post (author or admin only)
const deletePost = async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is author or admin
        if (post.author.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Actually delete the post instead of updating status
        await ForumPost.findByIdAndDelete(req.params.postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPost,
    createPost,
    addReply,
    toggleLike,
    deletePost
};
