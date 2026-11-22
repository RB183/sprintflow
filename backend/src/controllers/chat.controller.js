const Channel = require('../models/Channel');
const Message = require('../models/Message');

exports.getChannels = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const channels = await Channel.find({ orgId: orgId.toString() });
    res.json({ success: true, channels });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const messages = await Message.find({ channelId: channelId.toString() })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { text, userAvatar, role } = req.body;

    const message = await Message.create({
      channelId: channelId.toString(),
      senderId: (req.user?.id || req.user?._id || 'anonymous').toString(),
      senderName: req.user?.name || req.user?.email || 'User',
      userAvatar: userAvatar || req.user?.avatar || '',
      role: role || req.user?.role || 'member',
      text: (text || '').trim(),
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};
