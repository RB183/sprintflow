/**
 * Security Headers & Referrer Masking Middleware
 * Enforces enterprise defense-in-depth, zero-referrer leakage, and clickjacking protection.
 */

const securityHeaders = (req, res, next) => {
  // Obfuscate server framework fingerprint
  res.removeHeader('X-Powered-By');

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking / UI Redress attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Strip Referrer completely so external snooper/network cannot trace internal routes (/home to /terminal-chat)
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Cross-Site Scripting (XSS) protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Restrict camera, microphone, geolocation access
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:* https://*.firebaseio.com https://identitytoolkit.googleapis.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );

  next();
};

module.exports = securityHeaders;
