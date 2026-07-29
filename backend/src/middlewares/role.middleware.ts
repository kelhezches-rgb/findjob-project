import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' }); return
    }
    next()
  }
