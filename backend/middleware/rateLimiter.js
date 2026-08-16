const rateLimit = require("express-rate-limit");

/**
 * Global API Rate Limiter
 * Allows up to 500 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: 0,
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict Mutation / Auth Rate Limiter
 * Allows up to 100 sensitive requests per 15 minutes
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: 0,
    status: 429,
    message: "Too many attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * Standard Feature Limiter (Trips, Chat, Loyalty, Notifications)
 * Allows up to 300 requests per 15 minutes
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: 0,
    status: 429,
    message: "Request limit reached, please try again shortly.",
  },
});

module.exports = {
  apiLimiter,
  strictLimiter,
  standardLimiter,
};
