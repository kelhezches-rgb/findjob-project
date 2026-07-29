import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// ── General API limiter (all routes) ─────────────────────────
export const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // 15 minutes
  max:              200,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { message: 'Too many requests, please try again later.' },
})

// ── Auth endpoints limiter (stricter) ────────────────────────
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,  // 15 minutes
  max:              10,               // 10 attempts per 15 min
  standardHeaders:  true,
  legacyHeaders:    false,
  skipSuccessfulRequests: true,       // only count failed attempts
  keyGenerator: (req: Request) =>
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.ip ||
    'unknown',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      message: 'Too many login attempts. Please wait 15 minutes and try again.',
    })
  },
})

// ── File upload limiter ───────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max:      20,                 // 20 uploads per hour
  message: { message: 'Upload limit reached. Please try again in an hour.' },
})
