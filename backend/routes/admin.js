const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const Resource = require('../models/Resource');

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/dashboard/stats', adminAuth, async (req, res) => {
    try {
        // Get user statistics (exclude admin users)
        const userQuery = { $or: [{ isAdmin: false }, { isAdmin: { $exists: false } }] };
        const totalUsers = await User.countDocuments(userQuery);
        const activeUsers = await User.countDocuments({ ...userQuery, isActive: true });
        const newUsersThisMonth = await User.countDocuments({
            ...userQuery,
            createdAt: { $gte: new Date(new Date().setDate(1)) }
        });

        // Get quiz statistics
        const totalQuizAttempts = await QuizAttempt.countDocuments();
        const quizAttemptsToday = await QuizAttempt.countDocuments({
            completedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        // Get average quiz score
        const avgScoreResult = await QuizAttempt.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]);
        const avgQuizScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

        // Get resource statistics
        const totalResources = await Resource.countDocuments();
        const activeResources = await Resource.countDocuments({ isActive: true });

        // Get recent user registrations (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await User.countDocuments({
                ...userQuery,
                createdAt: { $gte: date, $lt: nextDate }
            });

            last7Days.push({
                date: date.toISOString().split('T')[0],
                count: count
            });
        }

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    newThisMonth: newUsersThisMonth
                },
                quizzes: {
                    totalAttempts: totalQuizAttempts,
                    attemptsToday: quizAttemptsToday,
                    averageScore: avgQuizScore
                },
                resources: {
                    total: totalResources,
                    active: activeResources
                },
                userGrowth: last7Days
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const isActive = req.query.isActive;

        const query = { $or: [{ isAdmin: false }, { isAdmin: { $exists: false } }] };

        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Only apply isActive filter if it's explicitly set to 'true' or 'false'
        if (isActive !== undefined && isActive !== '' && isActive !== null) {
            query.isActive = isActive === 'true';
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        // Get quiz stats for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const quizCount = await QuizAttempt.countDocuments({ userId: user._id });
            const avgScoreResult = await QuizAttempt.aggregate([
                { $match: { userId: user._id } },
                { $group: { _id: null, avgScore: { $avg: '$score' } } }
            ]);
            const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

            return {
                ...user.toObject(),
                quizStats: {
                    totalAttempts: quizCount,
                    averageScore: avgScore
                }
            };
        }));

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalUsers: total,
                    limit: limit
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details with performance
// @access  Admin
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get quiz attempts
        const quizAttempts = await QuizAttempt.find({ userId: user._id })
            .sort({ completedAt: -1 })
            .limit(10);

        // Get quiz statistics
        const quizStats = await QuizAttempt.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    averageScore: { $avg: '$score' },
                    totalQuestions: { $sum: '$totalQuestions' },
                    totalCorrect: { $sum: '$correctAnswers' }
                }
            }
        ]);

        const stats = quizStats.length > 0 ? quizStats[0] : {
            totalAttempts: 0,
            averageScore: 0,
            totalQuestions: 0,
            totalCorrect: 0
        };

        res.json({
            success: true,
            data: {
                user: user,
                quizAttempts: quizAttempts,
                statistics: {
                    totalAttempts: stats.totalAttempts,
                    averageScore: Math.round(stats.averageScore || 0),
                    totalQuestions: stats.totalQuestions,
                    totalCorrect: stats.totalCorrect,
                    accuracy: stats.totalQuestions > 0 
                        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
                        : 0
                }
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { email, name, phone, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (email) user.email = email;
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: await User.findById(user._id).select('-password')
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin user'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

// @route   GET /api/admin/resources
// @desc    Get all resources
// @access  Admin
router.get('/resources', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const category = req.query.category;

        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        const total = await Resource.countDocuments(query);
        const resources = await Resource.find(query)
            .populate('createdBy', 'email name')
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

// @route   POST /api/admin/resources
// @desc    Create resource
// @access  Admin
router.post('/resources', adminAuth, async (req, res) => {
    try {
        const { title, description, category, url, imageUrl, tags, difficulty, duration, isPremium } = req.body;

        if (!title || !description || !category || !url) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, category, and URL'
            });
        }

        const resource = new Resource({
            title,
            description,
            category,
            url,
            imageUrl: imageUrl || '',
            tags: tags || [],
            difficulty: difficulty || 'Beginner',
            duration: duration || '',
            isPremium: isPremium || false,
            createdBy: req.user.userId
        });

        await resource.save();

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: resource
        });
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating resource',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/resources/:id
// @desc    Update resource
// @access  Admin
router.put('/resources/:id', adminAuth, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        const { title, description, category, url, imageUrl, tags, difficulty, duration, isPremium, isActive } = req.body;

        if (title) resource.title = title;
        if (description) resource.description = description;
        if (category) resource.category = category;
        if (url) resource.url = url;
        if (imageUrl !== undefined) resource.imageUrl = imageUrl;
        if (tags) resource.tags = tags;
        if (difficulty) resource.difficulty = difficulty;
        if (duration !== undefined) resource.duration = duration;
        if (isPremium !== undefined) resource.isPremium = isPremium;
        if (isActive !== undefined) resource.isActive = isActive;

        await resource.save();

        res.json({
            success: true,
            message: 'Resource updated successfully',
            data: resource
        });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating resource',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/resources/:id
// @desc    Delete resource
// @access  Admin
router.delete('/resources/:id', adminAuth, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        await Resource.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resource',
            error: error.message
        });
    }
});

// @route   GET /api/admin/quiz/performance
// @desc    Get overall quiz performance
// @access  Admin
router.get('/quiz/performance', adminAuth, async (req, res) => {
    try {
        // Get top performing students
        const topStudents = await QuizAttempt.aggregate([
            {
                $group: {
                    _id: '$userId',
                    averageScore: { $avg: '$score' },
                    totalAttempts: { $sum: 1 },
                    totalCorrect: { $sum: '$correctAnswers' }
                }
            },
            { $sort: { averageScore: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details
        const topStudentsWithDetails = await Promise.all(
            topStudents.map(async (student) => {
                const user = await User.findById(student._id).select('email name');
                return {
                    user: user,
                    averageScore: Math.round(student.averageScore),
                    totalAttempts: student.totalAttempts,
                    totalCorrect: student.totalCorrect
                };
            })
        );

        // Get topic-wise performance
        const topicPerformance = await QuizAttempt.aggregate([
            {
                $group: {
                    _id: '$topic',
                    averageScore: { $avg: '$score' },
                    totalAttempts: { $sum: 1 },
                    totalStudents: { $addToSet: '$userId' }
                }
            },
            { $sort: { totalAttempts: -1 } },
            { $limit: 10 }
        ]);

        const topicStats = topicPerformance.map(topic => ({
            topic: topic._id,
            averageScore: Math.round(topic.averageScore),
            totalAttempts: topic.totalAttempts,
            totalStudents: topic.totalStudents.length
        }));

        res.json({
            success: true,
            data: {
                topStudents: topStudentsWithDetails,
                topicPerformance: topicStats
            }
        });
    } catch (error) {
        console.error('Quiz performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz performance',
            error: error.message
        });
    }
});

module.exports = router;
