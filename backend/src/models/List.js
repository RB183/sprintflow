const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

listSchema.index({ boardId: 1, order: 1 });

module.exports = mongoose.model('List', listSchema);
