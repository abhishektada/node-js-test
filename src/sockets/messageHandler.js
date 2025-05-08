const Message = require('../models/message');
const User = require('../models/user');
const Group = require('../models/group');

const messageHandler = (io) => {
    // Store user socket mappings
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle user authentication
        socket.on('authenticate', async (userId) => {
            try {
                const user = await User.findById(userId);
                if (user) {
                    userSockets.set(userId, socket.id);
                    socket.join(`user_${userId}`);
                    console.log(`User ${userId} authenticated`);
                }
            } catch (error) {
                console.error('Authentication error:', error);
            }
        });

        // Handle direct messages
        socket.on('direct_message', async (data) => {
            try {
                const { senderId, recipientId, content } = data;
                
                // Create message in database
                const message = new Message({
                    sender: senderId,
                    recipient: recipientId,
                    content,
                    messageType: 'direct'
                });
                await message.save();

                // Get recipient's socket
                const recipientSocketId = userSockets.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('new_message', {
                        type: 'direct',
                        message
                    });
                }

                // Send confirmation to sender
                socket.emit('message_sent', {
                    type: 'direct',
                    message
                });
            } catch (error) {
                console.error('Direct message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle group messages
        socket.on('group_message', async (data) => {
            try {
                const { senderId, groupId, content } = data;
                
                // Verify user is in group
                const group = await Group.findById(groupId);
                if (!group || !group.members.includes(senderId)) {
                    throw new Error('User not in group');
                }

                // Create message in database
                const message = new Message({
                    sender: senderId,
                    group: groupId,
                    content,
                    messageType: 'group'
                });
                await message.save();

                // Broadcast to all group members
                io.to(`group_${groupId}`).emit('new_message', {
                    type: 'group',
                    message
                });
            } catch (error) {
                console.error('Group message error:', error);
                socket.emit('error', { message: 'Failed to send group message' });
            }
        });

        // Handle group join
        socket.on('join_group', async (data) => {
            try {
                const { userId, groupId } = data;
                
                // Verify user is in group
                const group = await Group.findById(groupId);
                if (!group || !group.members.includes(userId)) {
                    throw new Error('User not in group');
                }

                socket.join(`group_${groupId}`);
                console.log(`User ${userId} joined group ${groupId}`);
            } catch (error) {
                console.error('Join group error:', error);
                socket.emit('error', { message: 'Failed to join group' });
            }
        });

        // Handle group leave
        socket.on('leave_group', (data) => {
            const { groupId } = data;
            socket.leave(`group_${groupId}`);
            console.log(`User left group ${groupId}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            // Remove user from socket mapping
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = messageHandler; 