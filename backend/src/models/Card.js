const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    id: { type: String },
    userId: { type: String },
    userName: { type: String },
    userAvatar: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const checklistSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    size: { type: Number, default: 0 },
    url: { type: String, required: true },
    type: { type: String, default: 'application/octet-stream' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    orgId: {
      type: String,
      index: true,
    },
    boardId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    listId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
      index: true,
    },
    assigneeId: {
      type: String,
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['task', 'feature', 'story', 'epic', 'bug'],
      default: 'task',
    },
    tags: [{ type: String }],
    dueDate: {
      type: String,
      default: null,
    },
    comments: [commentSchema],
    acceptanceCriteria: [checklistSchema],
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

cardSchema.index({ orgId: 1, status: 1, order: 1 });
cardSchema.index({ orgId: 1, assigneeId: 1 });
cardSchema.index({ key: 1 });

module.exports = mongoose.model('Card', cardSchema);
