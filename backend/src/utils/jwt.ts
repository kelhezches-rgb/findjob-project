import jwt from 'jsonwebtoken'
import { AuthPayload } from '../types'

const ACCESS_SECRET  = process.env.JWT_SECRET         || 'access-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret'

export const signAccessToken  = (p: AuthPayload) => jwt.sign(p, ACCESS_SECRET,  { expiresIn: '15m' } as jwt.SignOptions)
export const signRefreshToken = (p: AuthPayload) => jwt.sign(p, REFRESH_SECRET, { expiresIn: '7d'  } as jwt.SignOptions)
export const verifyAccessToken  = (t: string): AuthPayload => jwt.verify(t, ACCESS_SECRET)  as AuthPayload
export const verifyRefreshToken = (t: string): AuthPayload => jwt.verify(t, REFRESH_SECRET) as AuthPayload
