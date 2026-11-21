const mongoose = require('mongoose');

const appIntegrationSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    appId: {
      type: String,
      required: true,
      enum: ['github', 'slack', 'webhooks', 'canvas_sync', 'csv_export', 'jira'],
    },
    name: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

appIntegrationSchema.index({ orgId: 1, appId: 1 }, { unique: true });

module.exports = mongoose.model('AppIntegration', appIntegrationSchema);
