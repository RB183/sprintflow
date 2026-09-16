module.exports = (io, socket) => {
  socket.on('canvas:draw_stroke', (data) => {
    // Broadcast stroke to everyone in the organization canvas room except sender
    socket.to(`canvas:${data.orgId}`).emit('canvas:remote_stroke', data);
  });

  socket.on('canvas:cursor_move', (data) => {
    socket.to(`canvas:${data.orgId}`).emit('canvas:remote_cursor', data);
  });

  socket.on('canvas:join_room', (orgId) => {
    socket.join(`canvas:${orgId}`);
  });
};
