const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Invite = require('../models/Invite');
const Organization = require('../models/Organization');
const OrgMember = require('../models/OrgMember');
const { dispatchNotification } = require('./notification.controller');
const firebaseAuth = require('../config/firebase');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config/env');

const processPendingInvites = async (user) => {
  try {
    const normalizedEmail = user.email.toLowerCase().trim();
    const pendingInvites = await Invite.find({ email: normalizedEmail, status: 'pending' }).populate('orgId');

    for (const invite of pendingInvites) {
      if (invite.orgId) {
        const org = invite.orgId;
        const alreadyIn = org.members?.some((m) => m.userId.toString() === user._id.toString());
        if (!alreadyIn) {
          await Organization.findByIdAndUpdate(org._id, {
            $addToSet: { members: { userId: user._id, role: invite.role || 'member' } },
          });
        }
        await OrgMember.findOneAndUpdate(
          { userId: user._id, orgId: org._id },
          { userId: user._id, orgId: org._id, role: invite.role || 'member' },
          { upsert: true }
        );
        invite.status = 'accepted';
        await invite.save();

        await dispatchNotification({
          userId: user._id,
          title: 'Welcome to Space',
          message: `You were automatically added to "${org.name}" from your pending invitation.`,
          type: 'invite',
          spaceId: org._id,
        });
      }
    }

    // Ensure user has at least one workspace
    const userOrgsCount = await OrgMember.countDocuments({ userId: user._id });
    if (userOrgsCount === 0) {
      const defaultSlug = `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-workspace-${Date.now().toString(36)}`;
      const defaultOrg = await Organization.create({
        name: `${user.name}'s Workspace`,
        slug: defaultSlug,
        description: 'Personal team workspace',
        color: '#0052cc',
        ownerId: user._id,
        members: [{ userId: user._id, role: 'admin' }],
      });
      await OrgMember.create({
        userId: user._id,
        orgId: defaultOrg._id,
        role: 'admin',
      });
    }
  } catch (err) {
    console.error('[Auth] Failed to process pending invites:', err.message);
  }
};

const setSessionCookie = (res, token) => {
  res.cookie('sprintflow_session', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  title: user.title,
  emailVerified: Boolean(user.emailVerifiedAt),
});

const setAppSession = (res, user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
  setSessionCookie(res, token);
  return token;
};

/**
 * Register with Email and Password
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, title } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email address already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      title: title ? title.trim() : 'Software Engineer',
      authProvider: 'local',
      emailVerifiedAt: new Date(),
    });

    await processPendingInvites(user);

    const token = setAppSession(res, user);
    return res.status(201).json({ success: true, user: toPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
};

/**
 * Login with Email and Password
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created using Google/Firebase. Please sign in with Google.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await processPendingInvites(user);

    const token = setAppSession(res, user);
    return res.json({ success: true, user: toPublicUser(user), token });
  } catch (err) {
    return next(err);
  }
};

/**
 * Firebase ID Token Authentication
 */
exports.firebaseLogin = async (req, res, next) => {
  try {
    if (!firebaseAuth) {
      return res.status(503).json({ message: 'Firebase authentication is not configured on the server' });
    }

    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required' });

    const decoded = await firebaseAuth.verifyIdToken(idToken);
    if (!decoded.uid || !decoded.email) {
      return res.status(400).json({ message: 'Firebase account is missing a verified email' });
    }

    const normalizedEmail = decoded.email.toLowerCase();
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) user = await User.findOne({ email: normalizedEmail });

    const profile = {
      firebaseUid: decoded.uid,
      email: normalizedEmail,
      name: decoded.name || normalizedEmail.split('@')[0],
      avatar: decoded.picture || undefined,
      emailVerifiedAt: decoded.email_verified ? new Date() : null,
      authProvider: decoded.firebase?.sign_in_provider || 'firebase',
    };

    if (user) {
      Object.assign(user, profile);
      await user.save();
    } else {
      user = await User.create(profile);
      await processPendingInvites(user);
    }

    const token = setAppSession(res, user);
    return res.json({ success: true, user: toPublicUser(user), token });
  } catch (err) {
    if (err.code === 'auth/id-token-expired' || err.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Firebase session is invalid or expired' });
    }
    return next(err);
  }
};

/**
 * Logout
 */
exports.logout = (req, res) => {
  res.clearCookie('sprintflow_session', {
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    secure: NODE_ENV === 'production',
    path: '/',
  });
  res.json({ success: true });
};

/**
 * Get current authenticated user profile
 */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User account not found' });
    return res.json({ success: true, user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
};

/**
 * Update authenticated user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, title, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User account not found' });
    if (name) user.name = name.trim();
    if (title !== undefined) user.title = title.trim();
    if (avatar) user.avatar = avatar.trim();
    await user.save();

    return res.json({ success: true, user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
};
