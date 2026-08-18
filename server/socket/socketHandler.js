/**
 * Socket.io Handler
 * Manages real-time: Secure Chat + IDS alerts + Firewall logs
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const setupSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join user's personal room for direct messages
    socket.join(socket.userId);

    // Admin joins admin-room for IDS alerts
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`👑 Admin joined admin-room: ${socket.userId}`);
    });

    // Chat: typing indicator
    socket.on('typing', ({ toUserId }) => {
      io.to(toUserId).emit('user-typing', { fromUserId: socket.userId });
    });

    socket.on('stop-typing', ({ toUserId }) => {
      io.to(toUserId).emit('user-stop-typing', { fromUserId: socket.userId });
    });

    // Chat: mark message as read
    socket.on('mark-read', ({ fromUserId }) => {
      io.to(fromUserId).emit('messages-read', { byUserId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      io.emit('user-offline', { userId: socket.userId });
    });
  });
};

module.exports = setupSocket;
