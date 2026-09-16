const Card = require('../models/Card');

exports.createCard = async (req, res, next) => {
  try {
    const card = await Card.create(req.body);
    res.status(201).json({ success: true, card });
  } catch (err) {
    next(err);
  }
};

exports.updateCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, card });
  } catch (err) {
    next(err);
  }
};

exports.deleteCard = async (req, res, next) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.reorderCards = async (req, res, next) => {
  try {
    const { cardUpdates } = req.body;
    if (!cardUpdates || !cardUpdates.length) {
      return res.json({ success: true });
    }

    const bulkOps = cardUpdates.map(({ id, listId, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { listId, order } },
      },
    }));

    await Card.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Reordered successfully' });
  } catch (err) {
    next(err);
  }
};
