const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } = require('../config/env');

const setSessionCookie = (res, token) => {
  res.cookie('sprintflow_session', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setSessionCookie(res, token);

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    setSessionCookie(res, token);

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

exports.demoLogin = async (req, res, next) => {
  try {
    const demoUser = {
      id: 'usr-demo-lead',
      name: 'Alex Chen',
      email: 'alex.chen@sprintflow.io',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    const token = jwt.sign({ ...demoUser, demo: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    setSessionCookie(res, token);

    res.json({
      success: true,
      user: demoUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('sprintflow_session', { httpOnly: true, sameSite: NODE_ENV === 'production' ? 'none' : 'lax', secure: NODE_ENV === 'production', path: '/' });
  res.json({ success: true });
};

exports.me = async (req, res, next) => {
  try {
    if (req.user.demo) {
      const { demo: _demo, iat: _issuedAt, exp: _expiresAt, ...demoUser } = req.user;
      return res.json({ success: true, user: demoUser });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User account not found' });

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, title: user.title },
    });
  } catch (err) {
    return next(err);
  }
};
