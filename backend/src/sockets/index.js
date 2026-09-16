const { Server } = require('socket.io');
const registerCanvasHandler = require('./handlers/canvas.handler');
const registerChatHandler = require('./handlers/chat.handler');
const registerBoardHandler = require('./handlers/board.handler');
const { CLIENT_URL } = require('../config/env');

const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

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
