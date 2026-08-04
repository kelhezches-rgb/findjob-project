import { Router } from 'express'
import * as ctrl from './admin.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { requireRole } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { adminPatchUserSchema, adminPatchJobSchema, adminDeleteCompanySchema } from '../../validators'

const router = Router()
router.use(authenticate, requireRole('admin'))

router.get('/stats', ctrl.getStats)

router.get('/users',        ctrl.listUsers)
router.patch('/users/:id',  validate(adminPatchUserSchema), ctrl.updateUser)
router.delete('/users/:id', ctrl.deleteUser)

router.get('/jobs',              ctrl.listJobs)
router.patch('/jobs/:id/status', validate(adminPatchJobSchema), ctrl.setJobStatus)
router.delete('/jobs/:id',       ctrl.deleteJob)

router.get('/companies',                        ctrl.listCompanies)
router.patch('/companies/:id/verify',           ctrl.verifyCompany)
router.get('/companies/:id/deletion-impact',    ctrl.getCompanyDeletionImpact)
router.delete('/companies/:id', validate(adminDeleteCompanySchema), ctrl.deleteCompany)

export default router
