const Card = require('../models/Card');
const OrgMember = require('../models/OrgMember');

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
