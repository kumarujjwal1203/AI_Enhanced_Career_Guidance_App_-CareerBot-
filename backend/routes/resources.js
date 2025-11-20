const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/resources/categories/list
// @desc    Get all available categories
// @access  Private (authenticated users)
router.get('/categories/list', authMiddleware, async (req, res) => {
    try {
        const categories = await Resource.distinct('category', { isActive: true });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// @route   GET /api/resources
// @desc    Get all active resources (public for authenticated users)
// @access  Private (authenticated users)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const category = req.query.category;
        const difficulty = req.query.difficulty;

        // Only show active resources to regular users
        const query = { isActive: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        const total = await Resource.countDocuments(query);
        const resources = await Resource.find(query)
            .select('-createdBy -__v')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        res.json({
            success: true,
            data: {
                resources: resources,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalResources: total,
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: error.message
        });
    }
});

// @route   GET /api/resources/:id
// @desc    Get single resource and increment view count
// @access  Private (authenticated users)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .select('-createdBy -__v');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        if (!resource.isActive) {
            return res.status(403).json({
                success: false,
                message: 'This resource is not available'
            });
        }

        // Increment view count
        resource.viewCount += 1;
        await resource.save();

        res.json({
            success: true,
            data: resource
        });
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resource',
            error: error.message
        });
    }
});

module.exports = router;
