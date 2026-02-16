const Chat = require('../models/Chat');
const jwt = require('jsonwebtoken');

const socketHandler = (io) => {
    // Socket.io authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(socket.userId);

        // Handle joining a chat room
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        // Handle sending a message
        socket.on('send_message', async (data) => {
            try {
                const { chatId, receiverId, content } = data;

                // Find or create chat
                let chat = await Chat.findById(chatId);

                if (!chat) {
                    chat = await Chat.create({
                        participants: [socket.userId, receiverId],
                        messages: []
                    });
                }

                // Add message
                chat.messages.push({
                    sender: socket.userId,
                    content,
                    read: false
                });

                chat.lastMessage = content;
                chat.lastMessageTime = Date.now();

                await chat.save();
                await chat.populate('messages.sender', 'name role');

                // Emit to chat room
                io.to(chatId).emit('new_message', {
                    chatId: chat._id,
                    message: chat.messages[chat.messages.length - 1]
                });

                // Emit to receiver's personal room for notification
                io.to(receiverId).emit('message_notification', {
                    chatId: chat._id,
                    senderId: socket.userId,
                    content
                });

            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { chatId, receiverId } = data;
            io.to(receiverId).emit('user_typing', {
                chatId,
                userId: socket.userId
            });
        });

        // Handle stop typing
        socket.on('stop_typing', (data) => {
            const { chatId, receiverId } = data;
            io.to(receiverId).emit('user_stop_typing', {
                chatId,
                userId: socket.userId
            });
        });

        // Handle marking messages as read
        socket.on('mark_read', async (data) => {
            try {
                const { chatId } = data;
                const chat = await Chat.findById(chatId);

                if (chat) {
                    chat.messages.forEach(msg => {
                        if (msg.sender.toString() !== socket.userId) {
                            msg.read = true;
                        }
                    });
                    await chat.save();

                    io.to(chatId).emit('messages_read', { chatId });
                }
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });
    });
};

module.exports = socketHandler;
