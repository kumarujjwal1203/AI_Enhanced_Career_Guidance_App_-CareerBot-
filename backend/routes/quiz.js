const express = require('express');
const router = express.Router();
const QuizAttempt = require('../models/QuizAttempt');
const authMiddleware = require('../middleware/auth');

// Save quiz attempt
router.post('/save-attempt', authMiddleware, async (req, res) => {
  try {
    const { topic, questions, score, totalQuestions, correctAnswers, timeTaken } = req.body;

    if (!topic || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz data'
      });
    }

    const quizAttempt = new QuizAttempt({
      userId: req.userId,
      topic,
      questions,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken
    });

    await quizAttempt.save();

    res.status(201).json({
      success: true,
      message: 'Quiz attempt saved successfully',
      data: quizAttempt
    });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quiz attempt',
      error: error.message
    });
  }
});

// Get all quiz attempts for user
router.get('/attempts', authMiddleware, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.userId })
      .sort({ completedAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
});

// Get specific quiz attempt by ID
router.get('/attempts/:id', authMiddleware, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.id,
      userId: req.userId
    }).select('-__v');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempt',
      error: error.message
    });
  }
});

// Get quiz statistics for user
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.userId });

    const stats = {
      totalAttempts: attempts.length,
      totalQuestionsAnswered: attempts.reduce((sum, a) => sum + a.totalQuestions, 0),
      totalCorrectAnswers: attempts.reduce((sum, a) => sum + a.correctAnswers, 0),
      averageScore: attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0,
      topicStats: {}
    };

    // Calculate stats per topic
    attempts.forEach(attempt => {
      if (!stats.topicStats[attempt.topic]) {
        stats.topicStats[attempt.topic] = {
          attempts: 0,
          totalScore: 0,
          averageScore: 0
        };
      }
      stats.topicStats[attempt.topic].attempts++;
      stats.topicStats[attempt.topic].totalScore += attempt.score;
    });

    // Calculate average score per topic
    Object.keys(stats.topicStats).forEach(topic => {
      const topicData = stats.topicStats[topic];
      topicData.averageScore = Math.round(topicData.totalScore / topicData.attempts);
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching quiz statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
