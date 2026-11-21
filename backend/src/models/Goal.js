const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['On Track', 'At Risk', 'Behind', 'Completed'],
      default: 'On Track',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    targetDate: {
      type: String,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    keyResults: [
      {
        text: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
