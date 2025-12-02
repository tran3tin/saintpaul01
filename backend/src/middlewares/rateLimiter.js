// middleware/rateLimiter.js

const rateLimit = require("express-rate-limit");

const rateLimiter = (prefix, maxRequests, windowMs) => {
  return rateLimit({
    windowMs: windowMs * 1000, // Convert to milliseconds
    max: maxRequests,
    message: {
      success: false,
      error: "Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ một chút.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `${prefix}_${req.user?.id || req.ip}`;
    },
  });
};

module.exports = { rateLimiter };
