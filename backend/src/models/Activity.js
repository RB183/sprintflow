const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      index: true,
    },
    cardId: {
      type: String,
      default: null,
    },
    cardKey: {
      type: String,
      default: '',
    },
    cardTitle: {
      type: String,
      default: '',
    },
    actorId: {
      type: String,
      default: '',
    },
    actorName: {
      type: String,
      default: 'Team member',
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'moved', 'archived', 'restored', 'deleted'],
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ orgId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
