const Notification = require('../models/Notification');
const { getIO } = require('../sockets');

/**
 * Helper to create and broadcast a persistent notification
 */
const dispatchNotification = async ({ userId, title, message, type = 'system', spaceId = null, cardId = null, metadata = {} }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      spaceId,
      cardId,
      metadata,
    });

    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationController] Failed to dispatch notification:', err.message);
    return null;
  }
};

exports.dispatchNotification = dispatchNotification;

/**
 * Get notifications for authenticated user
 */
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 30;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('spaceId', 'name slug')
      .populate('cardId', 'title key');

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({ success: true, notification, unreadCount });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read for current user
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.json({ success: true, message: 'All notifications marked as read', unreadCount: 0 });
  } catch (err) {
    next(err);
  }
};
