import { Request, Response } from 'express'
import * as svc from './auth.service'
import { AuthRequest } from '../../types'

export const COOKIE = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production',
  // 'lax' cannot be sent on cross-site XHR/fetch (e.g. Vercel → Render).
  // Only 'none' works there, and 'none' requires Secure — safe here since
  // 'secure' is already tied to the same production check.
  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
}

export const register = async (req: Request, res: Response) => {
  try {
    const { user, accessToken, refreshToken } = await svc.register(req.body)
    res.cookie('refreshToken', refreshToken, COOKIE)
    res.status(201).json({ user, accessToken })
  } catch (e) { res.status(400).json({ message: (e as Error).message }) }
}

export const login = async (req: Request, res: Response) => {
  try {
    const result = await svc.login(req.body.email, req.body.password)

    // Account is PENDING_DELETION within its recovery window — do NOT grant
    // a normal session. The frontend shows the recovery screen and uses
    // recoveryToken to call /api/account/recover or just walks away.
    if ('requiresAccountRecovery' in result) {
      res.status(200).json(result)
      return
    }

    res.cookie('refreshToken', result.refreshToken, COOKIE)
    res.status(200).json({ user: result.user, accessToken: result.accessToken })
  } catch (e) { res.status(401).json({ message: (e as Error).message }) }
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/auth', secure: COOKIE.secure, sameSite: COOKIE.sameSite })
  res.status(200).json({ message: 'Logged out' })
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) { res.status(401).json({ message: 'No refresh token' }); return }
    const { user, accessToken } = await svc.refresh(token)
    res.status(200).json({ user, accessToken })
  } catch (e) {
    // Previously this swallowed the real error entirely — meaning any
    // cause (expired token, DB/schema mismatch, etc.) was invisible in
    // server logs, making this exact class of "why is refresh failing"
    // bug undiagnosable in production. Log it, still respond 401.
    console.error('[auth.refresh] failed:', (e as Error).message)
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  try { res.status(200).json({ user: await svc.getMe(req.user!.userId) }) }
  catch (e) { res.status(404).json({ message: (e as Error).message }) }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    if (!token) { res.status(400).json({ message: 'Token is required' }); return }
    await svc.verifyEmail(token)
    res.status(200).json({ message: 'Email verified successfully' })
  } catch (e) { res.status(400).json({ message: (e as Error).message }) }
}

export const resendVerification = async (req: Request, res: Response) => {
  try {
    await svc.resendVerification(req.body.email)
    res.status(200).json({ message: 'Verification email sent' })
  } catch (e) { res.status(400).json({ message: (e as Error).message }) }
}

export const forgotPassword = async (req: Request, res: Response) => {
  await svc.forgotPassword(req.body.email).catch(err =>
    console.error('[ForgotPassword]', err.message)
  )
  // Always 200 — prevents email enumeration
  res.status(200).json({ message: 'If that email exists, a reset link has been sent' })
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body
    if (!token || !password) { res.status(400).json({ message: 'Token and password required' }); return }
    if (password.length < 8) { res.status(400).json({ message: 'Password must be at least 8 characters' }); return }
    await svc.resetPassword(token, password)
    res.status(200).json({ message: 'Password reset successfully' })
  } catch (e) { res.status(400).json({ message: (e as Error).message }) }
}
