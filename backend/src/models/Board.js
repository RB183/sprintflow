const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', boardSchema);
