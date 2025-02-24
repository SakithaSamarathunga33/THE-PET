const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// Admin only routes
const adminOnly = async (req, res, next) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    } catch (error) {
        console.error("Admin auth error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Optional auth - don't require token but attach user if present
const optional = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        // Don't send error - just continue without user
        next();
    }
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceField) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            // Admin can access any resource
            if (req.user.userType === 'admin') {
                return next();
            }

            const resourceId = req[resourceField];
            if (resourceId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }

            next();
        } catch (error) {
            console.error("Owner/Admin check error:", error);
            res.status(500).json({ message: "Server error" });
        }
    };
};

module.exports = {
    protect,
    adminOnly,
    optional,
    ownerOrAdmin
};
