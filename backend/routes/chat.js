const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');

// Validation rules
const messageValidation = [
  body('sender').isIn(['user', 'ai']).withMessage('Sender must be either "user" or "ai"'),
  body('message').notEmpty().withMessage('Message cannot be empty').trim()
];

/**
 * @route   POST /api/chat/messages
 * @desc    Save a new chat message
 * @access  Private
 */
router.post('/messages', authMiddleware, messageValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { sender, message, meta } = req.body;
    const userId = req.userId;

    // Create new message
    const chatMessage = new ChatMessage({
      userId,
      sender,
      message,
      meta: meta || {}
    });

    await chatMessage.save();

    // Prune old messages to maintain MAX_HISTORY
    const maxHistory = parseInt(process.env.MAX_HISTORY) || 50;
    const messageCount = await ChatMessage.countDocuments({ userId });

    if (messageCount > maxHistory) {
      const toDeleteCount = messageCount - maxHistory;
      const oldMessages = await ChatMessage.find({ userId })
        .sort({ timestamp: 1 })
        .limit(toDeleteCount);
      
      const idsToDelete = oldMessages.map(msg => msg._id);
      await ChatMessage.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(201).json({
      success: true,
      message: 'Message saved successfully',
      data: chatMessage
    });
  } catch (error) {
    console.error('Save message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while saving message' 
    });
  }
});

/**
 * @route   GET /api/chat/messages
 * @desc    Fetch user's chat messages
 * @access  Private
 */
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || parseInt(process.env.MAX_HISTORY) || 50;

    // Fetch messages sorted by timestamp ascending
    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: 1 })
      .limit(limit);

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching messages' 
    });
  }
});

/**
 * @route   DELETE /api/chat/messages
 * @desc    Clear all user's chat messages
 * @access  Private
 */
router.delete('/messages', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Delete all messages for the user
    const result = await ChatMessage.deleteMany({ userId });

    res.json({
      success: true,
      message: 'All messages cleared successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while clearing messages' 
    });
  }
});

/**
 * @route   DELETE /api/chat/messages/:id
 * @desc    Delete a specific message
 * @access  Private
 */
router.delete('/messages/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const messageId = req.params.id;

    // Find and delete message (only if it belongs to the user)
    const message = await ChatMessage.findOneAndDelete({ 
      _id: messageId, 
      userId 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting message' 
    });
  }
});

module.exports = router;
