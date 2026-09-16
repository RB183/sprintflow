const mongoose = require('mongoose');

const canvasDocumentSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Architecture Whiteboard',
    },
    snapshotData: {
      type: String, // Data URL or serialized JSON canvas vectors
      default: '',
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CanvasDocument', canvasDocumentSchema);
