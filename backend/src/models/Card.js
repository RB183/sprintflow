const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
      index: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['task', 'feature', 'bug'],
      default: 'task',
    },
    tags: [{ type: String }],
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

cardSchema.index({ listId: 1, order: 1 });

module.exports = mongoose.model('Card', cardSchema);
