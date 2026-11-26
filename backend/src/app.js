const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { CLIENT_URL } = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');
const sanitize = require('./middleware/sanitize');
const { apiRateLimiter } = require('./middleware/rateLimiter');

const app = express();
app.disable('x-powered-by');

// Defense-in-depth: Security headers & Referrer masking
app.use(securityHeaders);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.trim().replace(/\/$/, '');
  const allowedOrigins = (CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (allowedOrigins.includes(cleanOrigin) || !CLIENT_URL) {
    return true;
  }
  // Allow localhost & loopback across ports (http & https)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }
  // Allow Vercel preview and production deployments (*.vercel.app)
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/.test(cleanOrigin)) {
    return true;
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));

// Body parsing with safe size bounds
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Input sanitization against injection
app.use(sanitize);

// General rate limiter
app.use('/api', apiRateLimiter);

// Root API Welcome & Status
app.get('/', (req, res) => {
  res.json({
    name: 'SprintFlow Enterprise Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
    client: 'https://sprintflow-two.vercel.app',
    timestamp: new Date().toISOString(),
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Serve built frontend assets in production with SPA fallback
const distPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

module.exports = app;
