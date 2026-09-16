const CanvasDocument = require('../models/CanvasDocument');

exports.getCanvas = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    let canvas = await CanvasDocument.findOne({ orgId });
    if (!canvas) {
      canvas = await CanvasDocument.create({ orgId, snapshotData: '' });
    }
    res.json({ success: true, canvas });
  } catch (err) {
    next(err);
  }
};

exports.saveCanvasSnapshot = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { snapshotData } = req.body;

    const canvas = await CanvasDocument.findOneAndUpdate(
      { orgId },
      { snapshotData, lastEditedBy: req.user?.id },
      { new: true, upsert: true }
    );

    res.json({ success: true, canvas });
  } catch (err) {
    next(err);
  }
};
