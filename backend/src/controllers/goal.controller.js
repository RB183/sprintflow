const Goal = require('../models/Goal');

exports.getGoals = async (req, res, next) => {
  try {
    const { orgId } = req.query;
    const filter = {};
    if (orgId && orgId.match(/^[0-9a-fA-F]{24}$/)) {
      filter.orgId = orgId;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (err) {
    next(err);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { orgId, title, status, progress, targetDate, keyResults } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Goal title is required' });
    }

    const goal = await Goal.create({
      orgId: orgId || req.user.currentOrgId,
      title: title.trim(),
      status: status || 'On Track',
      progress: Number(progress) || 0,
      targetDate,
      keyResults: Array.isArray(keyResults)
        ? keyResults.map((kr) => (typeof kr === 'string' ? { text: kr, done: false } : kr))
        : [],
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findByIdAndUpdate(id, req.body, { new: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Goal.findByIdAndDelete(id);
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (err) {
    next(err);
  }
};
