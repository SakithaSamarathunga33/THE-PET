const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxLength: 2000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const forumPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    content: {
        type: String,
        required: true,
        maxLength: 5000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['General', 'Health', 'Training', 'Behavior', 'Nutrition', 'Grooming', 'Other']
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
    },
    replies: [replySchema],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
forumPostSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Add text index for search functionality
forumPostSchema.index({ title: 'text', content: 'text' });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = ForumPost;
