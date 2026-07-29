import { Router } from 'express'
import * as ctrl from './job.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { requireRole } from '../../middlewares/role.middleware'
import { validate, validateQuery } from '../../middlewares/validate.middleware'
import { jobQuerySchema, applySchema } from '../../validators'
import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { verifyAccessToken } from '../../utils/jwt'

// Soft auth: attach req.user if a valid Bearer token is present, but never reject
const softAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try { req.user = verifyAccessToken(header.split(' ')[1]) } catch { /* no-op */ }
  }
  next()
}

const router = Router()

router.get('/categories', ctrl.categories)
router.get('/',    validateQuery(jobQuerySchema), ctrl.search)
router.get('/:id', softAuth, ctrl.getOne)         // soft auth → hasApplied field
router.post('/:id/apply', authenticate, requireRole('seeker'), validate(applySchema), ctrl.apply)

export default router
