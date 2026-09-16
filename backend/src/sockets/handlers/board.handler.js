module.exports = (io, socket) => {
  socket.on('board:join', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  socket.on('board:card_moved', (data) => {
    socket.to(`board:${data.boardId}`).emit('board:remote_card_moved', data);
  });
};
