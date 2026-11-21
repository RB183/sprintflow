const Plan = require('../models/Plan');

exports.getPlans = async (req, res, next) => {
  try {
    const { orgId } = req.query;
    const filter = {};
    if (orgId && orgId.match(/^[0-9a-fA-F]{24}$/)) {
      filter.orgId = orgId;
    }

    const plans = await Plan.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, plans });
  } catch (err) {
    next(err);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const { orgId, title, status, startDate, targetDate, committedPoints, deliverables, lead } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Plan/Sprint title is required' });
    }

    const plan = await Plan.create({
      orgId: orgId || req.user.currentOrgId,
      title: title.trim(),
      status: status || 'Active',
      startDate,
      targetDate,
      committedPoints: Number(committedPoints) || 40,
      completedPoints: 0,
      velocityRate: 0,
      lead: lead || req.user.name || 'Lead Architect',
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.committedPoints !== undefined || updates.completedPoints !== undefined) {
      const existing = await Plan.findById(id);
      if (existing) {
        const committed = updates.committedPoints !== undefined ? Number(updates.committedPoints) : existing.committedPoints;
        const completed = updates.completedPoints !== undefined ? Number(updates.completedPoints) : existing.completedPoints;
        updates.velocityRate = committed > 0 ? Math.min(100, Math.round((completed / committed) * 100)) : 0;
      }
    }

    const plan = await Plan.findByIdAndUpdate(id, updates, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    res.json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Plan.findByIdAndDelete(id);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    next(err);
  }
};
