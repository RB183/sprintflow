const Channel = require('../models/Channel');
const Message = require('../models/Message');

exports.getChannels = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    let channels = await Channel.find({ orgId: orgId.toString() });
    if (!channels || channels.length === 0) {
      channels = [
        { id: `${orgId}_general`, name: 'general', topic: 'Team wide announcements & discussions', orgId },
        { id: `${orgId}_engineering`, name: 'engineering', topic: 'Architecture & technical execution', orgId },
      ];
    }
    res.json({ success: true, channels });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { orgId } = req.query;
    const query = { channelId: channelId.toString() };
    if (orgId) {
      query.orgId = orgId.toString();
    }
    const messages = await Message.find(query)
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
    const { text, userAvatar, role, orgId } = req.body;

    const message = await Message.create({
      channelId: channelId.toString(),
      orgId: (orgId || '').toString(),
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
