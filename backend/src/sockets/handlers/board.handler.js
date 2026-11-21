module.exports = (io, socket) => {
  socket.on('board:join', (boardId) => {
    socket.join(`board:${boardId}`);
  });

  socket.on('board:card_moved', (data) => {
    const room = `board:${data.boardId || data.orgId}`;
    socket.to(room).emit('board:remote_card_moved', data);
  });

  socket.on('board:card_created', (data) => {
    const room = `board:${data.boardId || data.orgId}`;
    socket.to(room).emit('board:remote_card_created', data);
  });

  socket.on('board:card_updated', (data) => {
    const room = `board:${data.boardId || data.orgId}`;
    socket.to(room).emit('board:remote_card_updated', data);
  });

  socket.on('board:card_deleted', (data) => {
    const room = `board:${data.boardId || data.orgId}`;
    socket.to(room).emit('board:remote_card_deleted', data);
  });
};
