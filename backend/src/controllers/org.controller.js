const crypto = require('crypto');
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const OrgMember = require('../models/OrgMember');
const User = require('../models/User');
const Invite = require('../models/Invite');
const { dispatchNotification } = require('./notification.controller');
const { sendInviteEmail } = require('../services/emailService');
const { CLIENT_URL } = require('../config/env');
const { getIO } = require('../sockets');

/**
 * Format populated organization object for client
 */
const formatOrgForClient = (org, callerUserId) => {
  const orgObj = org.toObject ? org.toObject() : org;
  const ownerIdStr = orgObj.ownerId?._id ? orgObj.ownerId._id.toString() : orgObj.ownerId?.toString();
  const callerIdStr = callerUserId ? callerUserId.toString() : '';

  // Determine caller role
  let role = 'member';
  if (ownerIdStr === callerIdStr) {
    role = 'admin';
  } else if (Array.isArray(orgObj.members)) {
    const memberRecord = orgObj.members.find((m) => {
      const mUserId = m.userId?._id ? m.userId._id.toString() : m.userId?.toString();
      return mUserId === callerIdStr;
    });
    if (memberRecord) role = memberRecord.role || 'member';
  }

  // Format members array
  const formattedMembers = (orgObj.members || [])
    .map((m) => {
      const u = m.userId;
      if (!u) return null;
      return {
        id: u._id ? u._id.toString() : u.toString(),
        userId: u._id ? u._id.toString() : u.toString(),
        name: u.name || 'Member',
        email: u.email || '',
        avatar: u.avatar || '',
        title: u.title || 'Team Member',
        role: m.role || 'member',
      };
    })
    .filter(Boolean);

  return {
    ...orgObj,
    id: orgObj._id ? orgObj._id.toString() : orgObj.id,
    role,
    members: formattedMembers,
    memberCount: formattedMembers.length,
  };
};

/**
 * Get all organizations for current user (Owner & Member)
 * Standard Member can view all workspaces/spaces they belong to.
 */
exports.getUserOrganizations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Find spaces via memberships
    const memberships = await OrgMember.find({ userId });
    const orgIdsFromMemberships = memberships.map((m) => m.orgId);

    // 2. Query all organizations where user is owner, in members array, or has OrgMember
    const orgs = await Organization.find({
      $or: [
        { ownerId: userId },
        { 'members.userId': userId },
        { _id: { $in: orgIdsFromMemberships } },
      ],
    })
      .populate('members.userId', 'name email avatar title')
      .populate('ownerId', 'name email avatar title')
      .sort({ updatedAt: -1 });

    const formattedOrgs = orgs.map((org) => {
      // Ensure owner is in members array if missing
      const ownerIdStr = org.ownerId?._id ? org.ownerId._id.toString() : org.ownerId?.toString();
      const hasOwner = org.members.some((m) => {
        const mId = m.userId?._id ? m.userId._id.toString() : m.userId?.toString();
        return mId === ownerIdStr;
      });

      if (!hasOwner && org.ownerId) {
        org.members.unshift({ userId: org.ownerId, role: 'admin' });
      }

      return formatOrgForClient(org, userId);
    });

    res.json({ success: true, orgs: formattedOrgs });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new space / organization
 */
exports.createOrganization = async (req, res, next) => {
  try {
    const { name, slug, description, color, inviteEmails = [], invitedMemberIds = [] } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Space name is required' });
    }

    const generatedSlug =
      (slug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `space-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = generatedSlug;
    let counter = 1;
    while (await Organization.findOne({ slug: finalSlug })) {
      finalSlug = `${generatedSlug}-${counter}`;
      counter++;
    }

    const org = await Organization.create({
      name: name.trim(),
      slug: finalSlug,
      description: description ? description.trim() : '',
      color: color || '#0052cc',
      ownerId: userId,
      members: [{ userId, role: 'admin' }],
    });

    await OrgMember.create({
      userId,
      orgId: org._id,
      role: 'admin',
    });

    const io = getIO();

    // Process invited member IDs (registered users selected by user)
    if (Array.isArray(invitedMemberIds) && invitedMemberIds.length > 0) {
      for (const mId of invitedMemberIds) {
        if (!mId || mId.toString() === userId.toString()) continue;
        const targetUser = await User.findById(mId);
        if (targetUser) {
          org.members.push({ userId: targetUser._id, role: 'member' });
          await OrgMember.findOneAndUpdate(
            { userId: targetUser._id, orgId: org._id },
            { userId: targetUser._id, orgId: org._id, role: 'member' },
            { upsert: true }
          );

          const notif = await dispatchNotification({
            userId: targetUser._id,
            title: 'Added to Space',
            message: `${req.user.name || 'An admin'} added you to the space "${org.name}"`,
            type: 'invite',
            spaceId: org._id,
          });

          if (io) {
            io.to(`user:${targetUser._id.toString()}`).emit('space:invited', {
              ...org.toObject(),
              role: 'member',
            });
          }
        }
      }
      await org.save();
    }

    // Process any email invites provided during space creation
    if (Array.isArray(inviteEmails) && inviteEmails.length > 0) {
      for (const email of inviteEmails) {
        if (typeof email === 'string' && email.trim()) {
          const cleanEmail = email.trim().toLowerCase();
          try {
            const token = crypto.randomBytes(24).toString('hex');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await Invite.create({
              orgId: org._id,
              inviterId: userId,
              email: cleanEmail,
              role: 'member',
              token,
              expiresAt,
            });

            // If user already exists in DB, add them directly and dispatch notification
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
              const alreadyInMembers = org.members.some(
                (m) => m.userId.toString() === existingUser._id.toString()
              );
              if (!alreadyInMembers) {
                org.members.push({ userId: existingUser._id, role: 'member' });
                await org.save();
              }

              await OrgMember.findOneAndUpdate(
                { userId: existingUser._id, orgId: org._id },
                { userId: existingUser._id, orgId: org._id, role: 'member' },
                { upsert: true }
              );

              await dispatchNotification({
                userId: existingUser._id,
                title: 'Added to Space',
                message: `${req.user.name || 'An admin'} added you to the space "${org.name}"`,
                type: 'invite',
                spaceId: org._id,
              });

              if (io) {
                io.to(`user:${existingUser._id.toString()}`).emit('space:invited', {
                  ...org.toObject(),
                  role: 'member',
                });
              }
            }

            const inviteUrl = `${CLIENT_URL || 'http://localhost:5173'}/join/${token}`;
            sendInviteEmail({
              toEmail: cleanEmail,
              inviterName: req.user.name,
              spaceName: org.name,
              inviteUrl,
              role: 'member',
            }).catch((err) => console.error('[OrgController] Invite email failed:', err.message));
          } catch (invErr) {
            console.error('[OrgController] Error processing invite in space creation:', invErr.message);
          }
        }
      }
    }

    const populatedOrg = await Organization.findById(org._id)
      .populate('members.userId', 'name email avatar title')
      .populate('ownerId', 'name email avatar title');

    res.status(201).json({
      success: true,
      org: formatOrgForClient(populatedOrg, userId),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all members of a space
 */
exports.getSpaceMembers = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.spaceId;
    const userId = req.user.id;

    if (!orgId) return res.status(400).json({ message: 'Space ID is required' });

    const org = mongoose.Types.ObjectId.isValid(orgId)
      ? await Organization.findById(orgId)
          .populate('members.userId', 'name email avatar title')
          .populate('ownerId', 'name email avatar title')
      : await Organization.findOne({ slug: orgId })
          .populate('members.userId', 'name email avatar title')
          .populate('ownerId', 'name email avatar title');

    if (!org) return res.status(404).json({ message: 'Space not found' });

    // Also check OrgMember collection for any synchronized records
    const orgMembers = mongoose.Types.ObjectId.isValid(orgId)
      ? await OrgMember.find({ orgId }).populate('userId', 'name email avatar title')
      : [];

    const memberMap = new Map();

    // From org.members
    (org.members || []).forEach((m) => {
      if (m.userId) {
        const uId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
        memberMap.set(uId, {
          id: uId,
          userId: uId,
          name: m.userId.name || 'Member',
          email: m.userId.email || '',
          avatar: m.userId.avatar || '',
          title: m.userId.title || 'Team Member',
          role: m.role || 'member',
        });
      }
    });

    // From OrgMember collection
    orgMembers.forEach((m) => {
      if (m.userId) {
        const uId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
        if (!memberMap.has(uId)) {
          memberMap.set(uId, {
            id: uId,
            userId: uId,
            name: m.userId.name || 'Member',
            email: m.userId.email || '',
            avatar: m.userId.avatar || '',
            title: m.userId.title || 'Team Member',
            role: m.role || 'member',
          });
        }
      }
    });

    // Ensure owner is included
    if (org.ownerId) {
      const ownerIdStr = org.ownerId._id ? org.ownerId._id.toString() : org.ownerId.toString();
      if (!memberMap.has(ownerIdStr)) {
        memberMap.set(ownerIdStr, {
          id: ownerIdStr,
          userId: ownerIdStr,
          name: org.ownerId.name || 'Owner',
          email: org.ownerId.email || '',
          avatar: org.ownerId.avatar || '',
          title: org.ownerId.title || 'Space Owner',
          role: 'admin',
        });
      }
    }

    const formatted = Array.from(memberMap.values());
    res.json({ success: true, members: formatted });
  } catch (err) {
    next(err);
  }
};

/**
 * Multi-recipient email invites & user ID invite
 * Enforces RBAC: only Admin/Owner can invite
 */
exports.inviteMember = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.spaceId;
    const userId = req.user.id;
    const { emails = [], email, memberEmail, userId: targetUserId, memberId, role = 'member' } = req.body;

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: 'Space not found' });

    // Enforce Admin RBAC for inviting
    const callerMembership = await OrgMember.findOne({ orgId, userId });
    const isOwner = org.ownerId.toString() === userId.toString();
    const isAdmin = isOwner || callerMembership?.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only space administrators can invite new members' });
    }

    const io = getIO();
    const addedMembers = [];

    // 1. Check if direct targetUserId / memberId was passed
    const directUserId = targetUserId || memberId;
    if (directUserId) {
      const targetUser = await User.findById(directUserId);
      if (targetUser) {
        // Add to org.members if not already there
        const alreadyInMembers = org.members.some((m) => {
          const mId = m.userId?._id ? m.userId._id.toString() : m.userId?.toString();
          return mId === targetUser._id.toString();
        });

        if (!alreadyInMembers) {
          org.members.push({ userId: targetUser._id, role });
          await org.save();
        }

        await OrgMember.findOneAndUpdate(
          { userId: targetUser._id, orgId: org._id },
          { userId: targetUser._id, orgId: org._id, role },
          { upsert: true }
        );

        // Persistent notification
        const notification = await dispatchNotification({
          userId: targetUser._id,
          title: 'Added to Space',
          message: `${req.user.name || 'An admin'} added you to the space "${org.name}"`,
          type: 'invite',
          spaceId: org._id,
        });

        // Real-time socket broadcast
        if (io) {
          const populatedSpace = await Organization.findById(org._id)
            .populate('members.userId', 'name email avatar title');
          io.to(`user:${targetUser._id.toString()}`).emit('space:invited', formatOrgForClient(populatedSpace, targetUser._id));
        }

        addedMembers.push({
          userId: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role,
          status: 'added',
        });
      }
    }

    // 2. Check email / emails / memberEmail
    const recipientEmails = Array.isArray(emails) ? [...emails] : [];
    if (email && !recipientEmails.includes(email)) recipientEmails.push(email);
    if (memberEmail && !recipientEmails.includes(memberEmail)) recipientEmails.push(memberEmail);

    for (const rawEmail of recipientEmails) {
      if (!rawEmail || typeof rawEmail !== 'string') continue;
      const cleanEmail = rawEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) continue;

      const existingUser = await User.findOne({ email: cleanEmail });

      if (existingUser) {
        // Add existing user directly
        const alreadyInMembers = org.members.some((m) => {
          const mId = m.userId?._id ? m.userId._id.toString() : m.userId?.toString();
          return mId === existingUser._id.toString();
        });

        if (!alreadyInMembers) {
          org.members.push({ userId: existingUser._id, role });
          await org.save();
        }

        await OrgMember.findOneAndUpdate(
          { userId: existingUser._id, orgId: org._id },
          { userId: existingUser._id, orgId: org._id, role },
          { upsert: true }
        );

        await dispatchNotification({
          userId: existingUser._id,
          title: 'Added to Space',
          message: `${req.user.name || 'An admin'} added you to the space "${org.name}"`,
          type: 'invite',
          spaceId: org._id,
        });

        if (io) {
          const populatedSpace = await Organization.findById(org._id)
            .populate('members.userId', 'name email avatar title');
          io.to(`user:${existingUser._id.toString()}`).emit('space:invited', formatOrgForClient(populatedSpace, existingUser._id));
        }

        addedMembers.push({
          userId: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role,
          status: 'added',
        });
      } else {
        // Create transactional invite record
        const token = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await Invite.create({
          orgId: org._id,
          inviterId: userId,
          email: cleanEmail,
          role,
          token,
          expiresAt,
        });

        const inviteUrl = `${CLIENT_URL || 'http://localhost:5173'}/join/${token}`;
        sendInviteEmail({
          toEmail: cleanEmail,
          inviterName: req.user.name,
          spaceName: org.name,
          inviteUrl,
          role,
        }).catch((e) => console.error('[OrgController] Invite mail delivery failed:', e.message));

        addedMembers.push({
          email: cleanEmail,
          role,
          status: 'invited',
          inviteUrl,
        });
      }
    }

    if (addedMembers.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid user ID or recipient email address' });
    }

    const updatedSpace = await Organization.findById(org._id)
      .populate('members.userId', 'name email avatar title');

    res.json({
      success: true,
      message: `Successfully processed ${addedMembers.length} member invite(s)`,
      results: addedMembers,
      space: formatOrgForClient(updatedSpace, userId),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a member from a space
 */
exports.removeMember = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.spaceId;
    const targetUserId = req.params.userId || req.body.userId;
    const callerId = req.user.id;

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: 'Space not found' });

    const isOwner = org.ownerId.toString() === callerId.toString();
    const callerMembership = await OrgMember.findOne({ orgId, userId: callerId });
    const isAdmin = isOwner || callerMembership?.role === 'admin';

    if (!isAdmin && callerId.toString() !== targetUserId.toString()) {
      return res.status(403).json({ message: 'Only space administrators can remove members' });
    }

    // Do not allow removing space owner
    if (org.ownerId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Cannot remove the space owner' });
    }

    // Remove from org.members
    org.members = org.members.filter((m) => {
      const mId = m.userId?._id ? m.userId._id.toString() : m.userId?.toString();
      return mId !== targetUserId.toString();
    });
    await org.save();

    // Remove from OrgMember collection
    await OrgMember.findOneAndDelete({ orgId, userId: targetUserId });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a space and cascade delete all associated items
 * Strict RBAC: Only Admin or Owner can delete
 */
exports.deleteOrganization = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.spaceId;
    const userId = req.user.id;

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Strict RBAC: Only Admin or Owner can delete the space
    const isOwner = org.ownerId.toString() === userId.toString();
    const callerMembership = await OrgMember.findOne({ orgId, userId });
    const isOrgMemberAdmin = callerMembership?.role === 'admin';
    const isEmbeddedAdmin = org.members?.some(
      (m) => (m.userId?._id || m.userId)?.toString() === userId.toString() && m.role === 'admin'
    );

    const isAdmin = isOwner || isOrgMemberAdmin || isEmbeddedAdmin;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied: Only space administrators can delete this space' });
    }

    const orgName = org.name;
    const orgIdStr = org._id.toString();

    // 1. Delete Organization
    await Organization.findByIdAndDelete(orgId);

    // 2. Cascade delete memberships
    await OrgMember.deleteMany({ orgId });

    // 3. Cascade delete cards, plans, goals, apps, canvas, channels, messages
    const Card = require('../models/Card');
    const Plan = require('../models/Plan');
    const Goal = require('../models/Goal');
    const AppIntegration = require('../models/AppIntegration');
    const CanvasDocument = require('../models/CanvasDocument');
    const Channel = require('../models/Channel');
    const Message = require('../models/Message');
    const Notification = require('../models/Notification');

    await Card.deleteMany({ orgId: orgIdStr });
    await Plan.deleteMany({ orgId: orgIdStr });
    await Goal.deleteMany({ orgId: orgIdStr });
    await AppIntegration.deleteMany({ orgId: orgIdStr });
    await CanvasDocument.deleteMany({ orgId: orgIdStr }).catch(() => {});
    await Invite.deleteMany({ orgId }).catch(() => {});

    // Delete channels and their messages
    const channels = await Channel.find({ orgId: orgIdStr });
    const channelIds = channels.map((c) => c._id);
    if (channelIds.length > 0) {
      await Message.deleteMany({ channelId: { $in: channelIds } }).catch(() => {});
      await Channel.deleteMany({ orgId: orgIdStr }).catch(() => {});
    }

    // Clean up notifications for this space
    await Notification.deleteMany({ spaceId: orgId }).catch(() => {});

    // Real-time broadcast to any connected sockets
    const io = getIO();
    if (io) {
      io.emit('space:deleted', { spaceId: orgIdStr, name: orgName });
    }

    return res.json({
      success: true,
      message: `Space "${orgName}" deleted successfully`,
      spaceId: orgIdStr,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate a shareable invite link for a space
 */
exports.generateInviteLink = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.spaceId;
    const userId = req.user.id;
    const { role = 'member' } = req.body;

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: 'Space not found' });

    // Admin RBAC check
    const callerMembership = await OrgMember.findOne({ orgId, userId });
    const isOwner = org.ownerId.toString() === userId.toString();
    if (!isOwner && callerMembership?.role !== 'admin') {
      return res.status(403).json({ message: 'Only space administrators can generate invite links' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Invite.create({
      orgId,
      inviterId: userId,
      role,
      token,
      expiresAt,
    });

    const inviteUrl = `${CLIENT_URL || 'http://localhost:5173'}/join/${token}`;
    res.json({ success: true, token, inviteUrl, expiresAt });
  } catch (err) {
    next(err);
  }
};

/**
 * Join a space via invite token (authenticated)
 */
exports.joinByInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const invite = await Invite.findOne({ token, status: 'pending' }).populate('orgId');

    if (!invite) {
      return res.status(404).json({ message: 'Invitation link is invalid or has already been used' });
    }

    if (new Date() > new Date(invite.expiresAt)) {
      invite.status = 'expired';
      await invite.save();
      return res.status(410).json({ message: 'Invitation link has expired' });
    }

    const org = invite.orgId;
    if (!org) {
      return res.status(404).json({ message: 'The space associated with this invite no longer exists' });
    }

    // Add or update membership in org.members
    const alreadyIn = org.members.some((m) => {
      const mId = m.userId?._id ? m.userId._id.toString() : m.userId?.toString();
      return mId === userId.toString();
    });

    if (!alreadyIn) {
      org.members.push({ userId, role: invite.role || 'member' });
      await org.save();
    }

    // Add or update OrgMember collection
    await OrgMember.findOneAndUpdate(
      { userId, orgId: org._id },
      { userId, orgId: org._id, role: invite.role || 'member' },
      { upsert: true }
    );

    // If invite was email-specific, mark accepted
    if (invite.email) {
      invite.status = 'accepted';
      await invite.save();
    }

    // Persistent notification
    await dispatchNotification({
      userId,
      title: 'Joined Space',
      message: `You successfully joined "${org.name}" as a ${invite.role || 'member'}`,
      type: 'invite',
      spaceId: org._id,
    });

    const populatedOrg = await Organization.findById(org._id)
      .populate('members.userId', 'name email avatar title');

    res.json({
      success: true,
      message: `Successfully joined ${org.name}`,
      org: formatOrgForClient(populatedOrg, userId),
    });
  } catch (err) {
    next(err);
  }
};
