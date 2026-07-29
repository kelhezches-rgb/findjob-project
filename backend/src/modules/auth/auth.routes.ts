import { Router } from 'express'
import * as ctrl from './auth.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { registerSchema, loginSchema } from '../../validators'
import { authLimiter } from '../../middlewares/rateLimit.middleware'

const router = Router()

router.post('/register',            validate(registerSchema), ctrl.register)
router.post('/login',               authLimiter, validate(loginSchema), ctrl.login)
router.post('/logout',              ctrl.logout)
router.post('/refresh',             ctrl.refresh)
router.get('/me',                   authenticate, ctrl.me)
router.post('/verify-email',        ctrl.verifyEmail)
router.post('/resend-verification', ctrl.resendVerification)
router.post('/forgot-password',     authLimiter, ctrl.forgotPassword)
router.post('/reset-password',      ctrl.resetPassword)

export default router
