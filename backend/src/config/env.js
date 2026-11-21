const path = require('path');
const fs = require('fs');

const backendEnv = path.resolve(__dirname, '../../.env');
const rootEnv = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(backendEnv)) {
  require('dotenv').config({ path: backendEnv });
} else if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else {
  require('dotenv').config();
}

const normalizeEnvValue = (value) => value?.trim().replace(/^"([\s\S]*)",?$/, '$1').replace(/^'([\s\S]*)',?$/, '$1') || '';

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sprintflow',
  JWT_SECRET: process.env.JWT_SECRET || 'sprintflow_enterprise_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FIREBASE_PROJECT_ID: normalizeEnvValue(process.env.FIREBASE_PROJECT_ID),
  FIREBASE_CLIENT_EMAIL: normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL),
  FIREBASE_PRIVATE_KEY: normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY),
};
