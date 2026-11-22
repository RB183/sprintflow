module.exports = (io, socket) => {
  const normalizeId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? (id.id || id._id || id).toString() : id.toString();
  };

  socket.on('chat:join_channel', (channelId) => {
    const cleanId = normalizeId(channelId);
    if (cleanId) {
      socket.join(`chat:${cleanId}`);
    }
  });

  socket.on('chat:leave_channel', (channelId) => {
    const cleanId = normalizeId(channelId);
    if (cleanId) {
      socket.leave(`chat:${cleanId}`);
    }
  });

  socket.on('chat:send_message', (data) => {
    if (!data) return;
    const channelId = normalizeId(data.channelId || data.message?.channelId);
    const messagePayload = data.message || data;

    if (channelId) {
      socket.to(`chat:${channelId}`).emit('chat:new_message', messagePayload);
    } else {
      socket.broadcast.emit('chat:new_message', messagePayload);
    }
  });
};
