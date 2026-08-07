// auth.middleware.ts
import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AuthRequest } from '../types'
import prisma from '../config/db'

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }
  try {
    const payload = verifyAccessToken(header.split(' ')[1])

    // Extra DB check (beyond the stateless JWT) so a pending/completed
    // account deletion revokes protected-API access immediately, rather
    // than waiting for this access token to expire on its own. One
    // indexed primary-key lookup, minimal columns only.
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true, accountStatus: true },
    })
    if (!user || !user.isActive || user.accountStatus !== 'ACTIVE') {
      res.status(401).json({ message: 'Account is not active' })
      return
    }

    req.user = payload
    next()
  } catch (e) {
    console.error('[auth.middleware] token/DB check failed:', (e as Error).message)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
