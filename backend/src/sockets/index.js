const { Server } = require('socket.io');
const registerCanvasHandler = require('./handlers/canvas.handler');
const registerChatHandler = require('./handlers/chat.handler');
const registerBoardHandler = require('./handlers/board.handler');
const { CLIENT_URL } = require('../config/env');

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.trim().replace(/\/$/, '');
  const allowedOrigins = (CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (allowedOrigins.includes(cleanOrigin) || !CLIENT_URL) {
    return true;
  }
  // Allow localhost & loopback
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }
  // Allow Vercel preview and production deployments (*.vercel.app)
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/.test(cleanOrigin)) {
    return true;
  }
  return false;
};

let ioInstance = null;

const getIO = () => ioInstance;

const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  io.use((socket, next) => {
    const origin = socket.handshake.headers.origin;
    if (origin && !isAllowedOrigin(origin)) {
      return next(new Error('Unauthorized WebSocket origin'));
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // Join personal user notification room (support both user:join and join:user)
    const handleUserJoin = (userId) => {
      if (userId) {
        const room = `user:${userId}`;
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined personal room ${room}`);
      }
    };

    const handleUserLeave = (userId) => {
      if (userId) {
        const room = `user:${userId}`;
        socket.leave(room);
        console.log(`[Socket] ${socket.id} left personal room ${room}`);
      }
    };

    socket.on('user:join', handleUserJoin);
    socket.on('join:user', handleUserJoin);
    socket.on('user:leave', handleUserLeave);
    socket.on('leave:user', handleUserLeave);

    registerCanvasHandler(io, socket);
    registerChatHandler(io, socket);
    registerBoardHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSockets;
module.exports.getIO = getIO;
