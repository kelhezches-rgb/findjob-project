import { Request, Response } from 'express'
import * as svc from './auth.service'
import { AuthRequest } from '../../types'

const COOKIE = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
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
    const { user, accessToken, refreshToken } = await svc.login(req.body.email, req.body.password)
    res.cookie('refreshToken', refreshToken, COOKIE)
    res.status(200).json({ user, accessToken })
  } catch (e) { res.status(401).json({ message: (e as Error).message }) }
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/auth' })
  res.status(200).json({ message: 'Logged out' })
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) { res.status(401).json({ message: 'No refresh token' }); return }
    const { accessToken } = await svc.refresh(token)
    res.status(200).json({ accessToken })
  } catch { res.status(401).json({ message: 'Invalid refresh token' }) }
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
