const Card = require('../models/Card');
const User = require('../models/User');
const { dispatchNotification } = require('./notification.controller');

exports.getCards = async (req, res, next) => {
  try {
    const { orgId, boardId } = req.query;
    const filter = {};
    if (orgId) filter.orgId = orgId;
    if (boardId) filter.boardId = boardId;

    const cards = await Card.find(filter).sort({ order: 1 });
    res.json({ success: true, cards });
  } catch (err) {
    next(err);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const card = await Card.create(req.body);

    // If card is assigned to a user, send an in-app notification
    if (card.assigneeId) {
      try {
        let assigneeUser = null;
        if (card.assigneeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
          assigneeUser = await User.findById(card.assigneeId);
        } else {
          assigneeUser = await User.findOne({
            $or: [{ email: card.assigneeId.toString().toLowerCase() }, { name: card.assigneeId }],
          });
        }

        if (assigneeUser) {
          await dispatchNotification({
            userId: assigneeUser._id,
            title: 'Assigned to Task',
            message: `${req.user?.name || 'A teammate'} assigned you to task "${card.title}"`,
            type: 'assignment',
            cardId: card._id,
            spaceId: card.orgId && card.orgId.toString().match(/^[0-9a-fA-F]{24}$/) ? card.orgId : null,
          });
        }
      } catch (notifErr) {
        console.error('[CardController] Failed to dispatch assignment notification on create:', notifErr.message);
      }
    }

    res.status(201).json({ success: true, card });
  } catch (err) {
    next(err);
  }
};

exports.updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { $or: [{ _id: id }, { key: id }] };
    
    const oldCard = await Card.findOne(filter);
    const card = await Card.findOneAndUpdate(filter, req.body, { new: true });

    // If assignee was changed or newly assigned
    if (
      card &&
      req.body.assigneeId !== undefined &&
      req.body.assigneeId !== oldCard?.assigneeId &&
      card.assigneeId
    ) {
      try {
        let assigneeUser = null;
        if (card.assigneeId.toString().match(/^[0-9a-fA-F]{24}$/)) {
          assigneeUser = await User.findById(card.assigneeId);
        } else {
          assigneeUser = await User.findOne({
            $or: [{ email: card.assigneeId.toString().toLowerCase() }, { name: card.assigneeId }],
          });
        }

        if (assigneeUser) {
          await dispatchNotification({
            userId: assigneeUser._id,
            title: 'Assigned to Task',
            message: `${req.user?.name || 'A teammate'} assigned you to task "${card.title}"`,
            type: 'assignment',
            cardId: card._id,
            spaceId: card.orgId && card.orgId.toString().match(/^[0-9a-fA-F]{24}$/) ? card.orgId : null,
          });
        }
      } catch (notifErr) {
        console.error('[CardController] Failed to dispatch assignment notification on update:', notifErr.message);
      }
    }

    res.json({ success: true, card });
  } catch (err) {
    next(err);
  }
};

exports.deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { $or: [{ _id: id }, { key: id }] };
    await Card.findOneAndDelete(filter);
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

    const bulkOps = cardUpdates.map(({ id, listId, status, order }) => {
      const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { key: id };
      const updateFields = { order };
      if (listId !== undefined) updateFields.listId = listId;
      if (status !== undefined) updateFields.status = status;
      return {
        updateOne: {
          filter,
          update: { $set: updateFields },
        },
      };
    });

    await Card.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Reordered successfully' });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { key: id };
    const card = await Card.findOne(filter);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const newComment = {
      id: `comm-${Date.now()}`,
      userId: req.user?.id || 'usr-anon',
      userName: req.user?.name || 'User',
      userAvatar: req.user?.avatar,
      text: text.trim(),
      createdAt: new Date(),
    };

    card.comments.push(newComment);
    await card.save();

    res.json({ success: true, comment: newComment, card });
  } catch (err) {
    next(err);
  }
};
