import { Router } from 'express'
import * as ctrl from './account.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { authLimiter } from '../../middlewares/rateLimit.middleware'
import { deleteAccountRequestSchema, recoverAccountSchema } from '../../validators'

const router = Router()

router.post('/delete-request', authLimiter, authenticate, validate(deleteAccountRequestSchema), ctrl.deleteRequest)
router.post('/recover',        authLimiter, validate(recoverAccountSchema), ctrl.recover)
router.get('/deletion-status', authenticate, ctrl.deletionStatus)

export default router
