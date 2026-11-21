const Card = require('../models/Card');
const User = require('../models/User');

exports.getPersonalTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Find all cards assigned to user
    const tasks = await Card.find({ assigneeId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email avatar title createdAt').sort({ name: 1 });
    const formatted = users.map((u) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      title: u.title,
    }));
    res.json({ success: true, users: formatted });
  } catch (err) {
    next(err);
  }
};
