const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @route   GET /api/chat/conversations
// @desc    Get user's chat conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        })
            .populate('participants', 'name role email')
            .sort({ lastMessageTime: -1 });

        res.json({
            success: true,
            count: chats.length,
            chats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/chat/:chatId/messages
// @desc    Get messages for a chat
// @access  Private
router.get('/:chatId/messages', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('messages.sender', 'name role');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Check if user is participant
        if (!chat.participants.includes(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        res.json({
            success: true,
            messages: chat.messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        // Find or create chat between users
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, receiverId] }
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user.id, receiverId],
                messages: []
            });
        }

        // Add message
        chat.messages.push({
            sender: req.user.id,
            content,
            read: false
        });

        chat.lastMessage = content;
        chat.lastMessageTime = Date.now();

        await chat.save();
        await chat.populate('messages.sender', 'name role');

        res.json({
            success: true,
            message: 'Message sent successfully',
            chat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/chat/mark-read/:chatId
// @desc    Mark messages as read
// @access  Private
router.put('/mark-read/:chatId', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Mark all messages from other user as read
        chat.messages.forEach(msg => {
            if (msg.sender.toString() !== req.user.id) {
                msg.read = true;
            }
        });

        await chat.save();

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
