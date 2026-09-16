const Channel = require('../models/Channel');
const Message = require('../models/Message');

exports.getChannels = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const channels = await Channel.find({ orgId });
    res.json({ success: true, channels });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const messages = await Message.find({ channelId }).sort({ createdAt: 1 }).limit(100);
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { text } = req.body;

    const message = await Message.create({
      channelId,
      senderId: req.user.id,
      senderName: req.user.name,
      text,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};
