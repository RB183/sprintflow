const mongoose = require('mongoose');

const orgMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate memberships
orgMemberSchema.index({ userId: 1, orgId: 1 }, { unique: true });

module.exports = mongoose.model('OrgMember', orgMemberSchema);
