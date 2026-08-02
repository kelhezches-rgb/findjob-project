import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import path from 'path'

import authRoutes     from './modules/auth/auth.routes'
import seekerRoutes   from './modules/seeker/seeker.routes'
import employerRoutes from './modules/employer/employer.routes'
import jobsRoutes     from './modules/jobs/jobs.routes'
import adminRoutes    from './modules/admin/admin.routes'
import companyRoutes  from './modules/companies/company.routes'
import accountRoutes  from './modules/account/account.routes'
import { errorHandler } from './middlewares/error.middleware'
import { generalLimiter, authLimiter } from './middlewares/rateLimit.middleware'

const app = express()

// ── Security headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,   // needed for uploads served inline
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
    ? undefined
    : false,                          // relax CSP in development
}))

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://jobboard-th.vercel.app",
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`))
      }
    },
    credentials: true,
  })
)

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

// ── Rate limiting ────────────────────────────────────────────
app.use('/api', generalLimiter)                   // 200 req / 15 min for all routes
app.use('/api/auth/login',    authLimiter)         // 10 attempts / 15 min
app.use('/api/auth/register', authLimiter)

// ── Static files (uploaded PDFs, company logos/cover images) ──
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')))

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/seeker',    seekerRoutes)
app.use('/api/employer',  employerRoutes)
app.use('/api/jobs',      jobsRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/account',   accountRoutes)

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running  → http://localhost:${PORT}`)
  console.log(`   Health check   → http://localhost:${PORT}/api/health`)
  console.log(`   Environment    → ${process.env.NODE_ENV || 'development'}`)
})

