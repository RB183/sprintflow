module.exports = (io, socket) => {
  const normalizeId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? (id.id || id._id || id).toString() : id.toString();
  };

  socket.on('canvas:join_room', (orgId) => {
    const cleanId = normalizeId(orgId);
    if (cleanId) {
      socket.join(`canvas:${cleanId}`);
    }
  });

  socket.on('canvas:leave_room', (orgId) => {
    const cleanId = normalizeId(orgId);
    if (cleanId) {
      socket.leave(`canvas:${cleanId}`);
    }
  });

  socket.on('canvas:draw_stroke', (data) => {
    if (!data) return;
    const cleanId = normalizeId(data.orgId);
    if (cleanId) {
      socket.to(`canvas:${cleanId}`).emit('canvas:remote_stroke', data);
    } else {
      socket.broadcast.emit('canvas:remote_stroke', data);
    }
  });

  socket.on('canvas:cursor_move', (data) => {
    if (!data) return;
    const cleanId = normalizeId(data.orgId);
    if (cleanId) {
      socket.to(`canvas:${cleanId}`).emit('canvas:remote_cursor', data);
    }
  });

  socket.on('canvas:clear', (data) => {
    if (!data) return;
    const cleanId = normalizeId(data.orgId);
    if (cleanId) {
      socket.to(`canvas:${cleanId}`).emit('canvas:remote_clear', data);
    } else {
      socket.broadcast.emit('canvas:remote_clear', data);
    }
  });
};
