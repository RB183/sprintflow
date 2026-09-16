module.exports = (io, socket) => {
  socket.on('chat:join_channel', (channelId) => {
    socket.join(`chat:${channelId}`);
  });

  socket.on('chat:send_message', (data) => {
    io.to(`chat:${data.channelId}`).emit('chat:new_message', data);
  });
};
