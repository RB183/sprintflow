const mongoose = require('mongoose');
const Card = require('../models/Card');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Organization = require('../models/Organization');
const OrgMember = require('../models/OrgMember');
const { dispatchNotification } = require('./notification.controller');

const getCardFilter = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { $or: [{ _id: id }, { key: id }] };

const hasOrganizationAccess = async (orgId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orgId) || !userId) return false;
  const organization = await Organization.findById(orgId).select('ownerId members.userId');
  if (!organization) return false;

  const normalizedUserId = userId.toString();
  const isOrganizationMember =
    organization.ownerId?.toString() === normalizedUserId ||
    organization.members.some((member) => member.userId?.toString() === normalizedUserId);
  if (isOrganizationMember) return true;

  return Boolean(await OrgMember.exists({ orgId, userId: normalizedUserId }));
};

const recordActivity = async (req, card, action, summary) => {
  try {
    await Activity.create({
      orgId: card.orgId?.toString(),
      cardId: card._id?.toString(),
      cardKey: card.key,
      cardTitle: card.title,
      actorId: req.user?.id?.toString() || '',
      actorName: req.user?.name || req.user?.email || 'Team member',
      action,
      summary,
    });
  } catch (err) {
    console.error('[CardController] Failed to record activity:', err.message);
  }
};

exports.getCards = async (req, res, next) => {
  try {
    const { orgId, boardId, archived } = req.query;
    if (archived === 'true') {
      if (!orgId) return res.status(400).json({ message: 'orgId is required to view archived cards' });
      if (!(await hasOrganizationAccess(orgId, req.user?.id))) {
        return res.status(403).json({ message: 'You do not have access to this organization' });
      }
    }

    const filter = {};
    if (orgId) filter.orgId = orgId;
    if (boardId) filter.boardId = boardId;
    filter.archivedAt = archived === 'true' ? { $ne: null } : null;

    const cards = await Card.find(filter).sort({ order: 1 });
    res.json({ success: true, cards });
  } catch (err) {
    next(err);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const card = await Card.create(req.body);
    await recordActivity(req, card, 'created', `created "${card.title}"`);

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
    const filter = getCardFilter(id);

    const oldCard = await Card.findOne(filter);
    const card = await Card.findOneAndUpdate(filter, req.body, { new: true });

    if (card) {
      const moved = oldCard && req.body.status !== undefined && req.body.status !== oldCard.status;
      const action = moved ? 'moved' : 'updated';
      const summary = moved
        ? `moved "${card.title}" to ${String(card.status || '').replace('_', ' ')}`
        : `updated "${card.title}"`;
      await recordActivity(req, card, action, summary);
    }

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
    const card = await Card.findOneAndDelete(getCardFilter(id));
    if (card) await recordActivity(req, card, 'deleted', `permanently deleted "${card.title}"`);
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const setCardArchiveState = async (req, res, next, shouldArchive) => {
  try {
    const { id } = req.params;
    const filter = getCardFilter(id);
    const existingCard = await Card.findOne(filter);
    if (!existingCard) return res.status(404).json({ message: 'Card not found' });
    if (!(await hasOrganizationAccess(existingCard.orgId, req.user?.id))) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }
    if (Boolean(existingCard.archivedAt) === shouldArchive) {
      return res.json({ success: true, card: existingCard });
    }

    const card = await Card.findOneAndUpdate(
      filter,
      { $set: { archivedAt: shouldArchive ? new Date() : null } },
      { new: true, runValidators: true }
    );
    const action = shouldArchive ? 'archived' : 'restored';
    await recordActivity(req, card, action, `${action} "${card.title}"`);
    res.json({ success: true, card });
  } catch (err) {
    next(err);
  }
};

exports.archiveCard = (req, res, next) => setCardArchiveState(req, res, next, true);
exports.restoreCard = (req, res, next) => setCardArchiveState(req, res, next, false);

exports.archiveDoneCards = async (req, res, next) => {
  try {
    const { orgId } = req.body;
    if (!(await hasOrganizationAccess(orgId, req.user?.id))) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }

    const filter = { orgId, status: 'done', archivedAt: null };
    const cardsToArchive = await Card.find(filter);
    if (!cardsToArchive.length) {
      return res.json({ success: true, archivedCount: 0, cards: [] });
    }

    const archivedAt = new Date();
    await Card.updateMany(filter, { $set: { archivedAt } });
    const cards = cardsToArchive.map((card) => ({
      ...card.toObject(),
      archivedAt,
    }));

    await Promise.all(
      cards.map((card) =>
        recordActivity(req, card, 'archived', `archived "${card.title}"`)
      )
    );

    res.json({ success: true, archivedCount: cards.length, cards });
  } catch (err) {
    next(err);
  }
};

exports.getOrganizationActivity = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    if (!(await hasOrganizationAccess(orgId, req.user?.id))) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }

    const activities = await Activity.find({ orgId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, activities });
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
      const filter = getCardFilter(id);
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
