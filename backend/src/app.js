const express = require('express');
const cors = require('cors');
const { CLIENT_URL } = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
