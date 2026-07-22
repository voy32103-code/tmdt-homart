// Security Headers & Rate Limiting Middleware (Zero External Dependency)

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

const rateLimitStores = new Map();

function createRateLimiter({ windowMs = 60 * 1000, max = 60, message = 'Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau.' }) {
  return (req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (Array.isArray(ip)) ip = ip[0];
    if (ip.includes('::ffff:')) ip = ip.replace('::ffff:', '');
    if (ip === '::1') ip = '127.0.0.1';

    const now = Date.now();
    let record = rateLimitStores.get(ip);

    if (!record || (now - record.startTime) > windowMs) {
      record = { startTime: now, count: 1 };
      rateLimitStores.set(ip, record);
    } else {
      record.count += 1;
    }

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.startTime + windowMs - now) / 1000));
      return res.status(429).json({ message });
    }

    next();
  };
}

// Memory cleanup for old rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStores.entries()) {
    if (now - record.startTime > 5 * 60 * 1000) {
      rateLimitStores.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

module.exports = {
  securityHeaders,
  createRateLimiter
};
