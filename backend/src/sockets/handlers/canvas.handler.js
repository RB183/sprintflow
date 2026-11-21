module.exports = (io, socket) => {
  socket.on('canvas:join_room', (orgId) => {
    socket.join(`canvas:${orgId}`);
  });

  socket.on('canvas:draw_stroke', (data) => {
    socket.to(`canvas:${data.orgId}`).emit('canvas:remote_stroke', data);
  });

  socket.on('canvas:cursor_move', (data) => {
    socket.to(`canvas:${data.orgId}`).emit('canvas:remote_cursor', data);
  });

  socket.on('canvas:clear', (data) => {
    socket.to(`canvas:${data.orgId}`).emit('canvas:remote_clear', data);
  });
};
