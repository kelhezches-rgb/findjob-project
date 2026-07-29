// auth.middleware.ts
import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AuthRequest } from '../types'

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }
  try {
    req.user = verifyAccessToken(header.split(' ')[1])
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
