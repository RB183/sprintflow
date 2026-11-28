module.exports = (io, socket) => {
  const normalizeId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? (id.id || id._id || id).toString() : id.toString();
  };

  socket.on('chat:join_channel', (data) => {
    const channelId = typeof data === 'object' ? normalizeId(data.channelId) : normalizeId(data);
    const orgId = typeof data === 'object' ? normalizeId(data.orgId) : '';
    if (orgId && channelId && !channelId.startsWith(orgId)) {
      socket.join(`chat:${orgId}:${channelId}`);
    }
    if (channelId) {
      socket.join(`chat:${channelId}`);
    }
  });

  socket.on('chat:leave_channel', (data) => {
    const channelId = typeof data === 'object' ? normalizeId(data.channelId) : normalizeId(data);
    const orgId = typeof data === 'object' ? normalizeId(data.orgId) : '';
    if (orgId && channelId && !channelId.startsWith(orgId)) {
      socket.leave(`chat:${orgId}:${channelId}`);
    }
    if (channelId) {
      socket.leave(`chat:${channelId}`);
    }
  });

  socket.on('chat:send_message', (data) => {
    if (!data) return;
    const channelId = normalizeId(data.channelId || data.message?.channelId);
    const orgId = normalizeId(data.orgId || data.message?.orgId);
    const messagePayload = data.message || data;

    if (orgId && channelId && !channelId.startsWith(orgId)) {
      socket.to(`chat:${orgId}:${channelId}`).emit('chat:new_message', messagePayload);
    }
    if (channelId) {
      socket.to(`chat:${channelId}`).emit('chat:new_message', messagePayload);
    } else {
      socket.broadcast.emit('chat:new_message', messagePayload);
    }
  });
};
