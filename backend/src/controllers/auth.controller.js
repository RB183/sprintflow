const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
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

    res.json({
      success: true,
      token,
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

    const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      token,
      user: demoUser,
    });
  } catch (err) {
    next(err);
  }
};
