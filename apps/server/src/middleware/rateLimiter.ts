import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 500 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Configure validation to match Express trust proxy hop count
  validate: {
    trustProxy: (
      Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
        ? Number(process.env.TRUST_PROXY_HOPS)
        : (process.env.NODE_ENV === 'production' ? 1 : 0)
    ) > 0,
    xForwardedForHeader: true
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configure validation to match Express trust proxy hop count
  validate: {
    trustProxy: (
      Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
        ? Number(process.env.TRUST_PROXY_HOPS)
        : (process.env.NODE_ENV === 'production' ? 1 : 0)
    ) > 0,
    xForwardedForHeader: true
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// API rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 API requests per windowMs
  message: {
    error: 'Too many API requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configure validation to match Express trust proxy hop count
  validate: {
    trustProxy: (
      Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
        ? Number(process.env.TRUST_PROXY_HOPS)
        : (process.env.NODE_ENV === 'production' ? 1 : 0)
    ) > 0,
    xForwardedForHeader: true
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many API requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for waitlist signup
export const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 waitlist signups per hour
  message: {
    error: 'Too many waitlist signup attempts from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configure validation to match Express trust proxy hop count
  validate: {
    trustProxy: (
      Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
        ? Number(process.env.TRUST_PROXY_HOPS)
        : (process.env.NODE_ENV === 'production' ? 1 : 0)
    ) > 0,
    xForwardedForHeader: true
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many waitlist signup attempts from this IP, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// Very strict rate limiter for contact forms
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // Limit each IP to 2 contact form submissions per hour
  message: {
    error: 'Too many contact form submissions from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configure validation to match Express trust proxy hop count
  validate: {
    trustProxy: (
      Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
        ? Number(process.env.TRUST_PROXY_HOPS)
        : (process.env.NODE_ENV === 'production' ? 1 : 0)
    ) > 0,
    xForwardedForHeader: true
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many contact form submissions from this IP, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// Rate limiter for webhook endpoints (more lenient)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Limit each IP to 50 webhook requests per minute
  message: {
    error: 'Too many webhook requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Configure validation to match Express trust proxy hop count
  validate: {
    trustProxy: (
      Number.isFinite(Number(process.env.TRUST_PROXY_HOPS))
        ? Number(process.env.TRUST_PROXY_HOPS)
        : (process.env.NODE_ENV === 'production' ? 1 : 0)
    ) > 0,
    xForwardedForHeader: true
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many webhook requests from this IP, please try again later.',
      retryAfter: '1 minute'
    });
  }
});
