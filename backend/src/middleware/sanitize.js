
/**
 * NoSQL Injection & Prototype Pollution Sanitizer
 * Strips dangerous MongoDB operator keys ($gt, $ne, $where, etc.) and prototype keys.
 */

const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    // Drop MongoDB operators ($where, $gt, etc.) and dot notation attempts
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    // Guard against prototype pollution attacks
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    clean[key] = sanitizeData(value);
  }

  return clean;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeData(req.body);
  if (req.query) req.query = sanitizeData(req.query);
  if (req.params) req.params = sanitizeData(req.params);
  next();
};

module.exports = sanitizeMiddleware;
