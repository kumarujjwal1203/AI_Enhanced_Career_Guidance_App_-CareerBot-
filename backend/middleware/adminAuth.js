const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify admin access
const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and check if admin
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Attach user to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            isAdmin: user.isAdmin
        };

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

module.exports = adminAuth;
