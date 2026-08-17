const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

/**
 * Global API Rate Limiter
 * Allows generous capacity for interactive browsing and SPA queries
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 3000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: 0,
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict Mutation / Auth Rate Limiter
 * Protects login/signup brute-force attempts
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: 0,
    status: 429,
    message: "Too many attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * Standard Feature Limiter (Trips, House Creation, Chat, Loyalty, Notifications)
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 2500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
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
