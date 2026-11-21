/**
 * High-Performance Sliding Window Rate Limiter
 * Guards endpoints against credential stuffing, brute-force attacks, and DoS flooding.
 */

const ipRequests = new Map();

// Periodic garbage collection to maintain minimal memory footprint
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRequests.entries()) {
    if (now - record.startTime > record.windowMs) {
      ipRequests.delete(key);
    }
  }
}, 3 * 60 * 1000).unref();

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this client, please try again later.',
} = {}) => {
  return (req, res, next) => {
    const rawIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1';

    const now = Date.now();
    const key = `${req.baseUrl || ''}:${rawIp}`;

    let record = ipRequests.get(key);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now, windowMs };
      ipRequests.set(key, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.startTime + windowMs) / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.startTime + windowMs - now) / 1000));
      return res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  };
};

// Strict rate limit for auth endpoints (15 req / 15 mins)
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please pause and try again in a few minutes.',
});

// General rate limit for API endpoints (400 req / 5 mins)
const apiRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 400,
  message: 'API rate limit exceeded. Please throttle your requests.',
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
};
