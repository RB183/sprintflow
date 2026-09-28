const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('sprintflow_session='))
      ?.split('=').slice(1).join('=');
    const token = bearerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Missing or invalid token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Token expired or invalid' });
  }
};

module.exports = authMiddleware;
