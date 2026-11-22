const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'member',
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
