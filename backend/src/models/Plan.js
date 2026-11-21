const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
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
      enum: ['Active', 'Upcoming', 'Completed', 'IN_PROGRESS', 'UPCOMING', 'COMPLETED'],
      default: 'Active',
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    targetDate: {
      type: String,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    committedPoints: {
      type: Number,
      default: 40,
    },
    completedPoints: {
      type: Number,
      default: 0,
    },
    velocityRate: {
      type: Number,
      default: 0,
    },
    lead: {
      type: String,
      default: 'Lead Architect',
    },
    deliverables: {
      type: [String],
      default: ['Initial Architecture', 'Core Implementation', 'Verification & QA'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
