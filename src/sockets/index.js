const jwt = require('jsonwebtoken');
const { User, GroupUser } = require('../models');

function initSockets(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Join group rooms
    socket.on('joinGroup', async (groupId) => {
      const membership = await GroupUser.findOne({ where: { userId: socket.user.id, groupId } });
      if (membership) socket.join(`group_${groupId}`);
    });

    // Leave group rooms
    socket.on('leaveGroup', (groupId) => {
      socket.leave(`group_${groupId}`);
    });

    // Send message to user
    socket.on('privateMessage', ({ toUserId, content }) => {
      io.sockets.sockets.forEach((s) => {
        if (s.user && s.user.id === toUserId) {
          s.emit('privateMessage', { fromUserId: socket.user.id, content });
        }
      });
    });

    // Send message to group
    socket.on('groupMessage', ({ groupId, content }) => {
      io.to(`group_${groupId}`).emit('groupMessage', { fromUserId: socket.user.id, groupId, content });
    });
  });
}

module.exports = initSockets;
