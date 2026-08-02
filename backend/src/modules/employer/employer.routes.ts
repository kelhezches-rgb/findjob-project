import { Router } from 'express'
import * as ctrl from './employer.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { requireRole } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadImage } from '../../config/multer'
import {
  createJobSchema, updateJobSchema,
  jobStatusSchema, applicationStatusSchema,
} from '../../validators'

const router = Router()
router.use(authenticate, requireRole('employer'))

router.get('/profile', ctrl.getProfile)
router.put('/profile', ctrl.updateProfile)
router.post('/profile/logo',  uploadImage.single('file'), ctrl.uploadLogo)
router.post('/profile/cover', uploadImage.single('file'), ctrl.uploadCover)

router.get('/jobs',         ctrl.listJobs)
router.post('/jobs',        validate(createJobSchema), ctrl.createJob)
router.get('/jobs/:id',     ctrl.getJob)
router.put('/jobs/:id',     validate(updateJobSchema), ctrl.updateJob)
router.patch('/jobs/:id/status', validate(jobStatusSchema), ctrl.setStatus)
router.delete('/jobs/:id',  ctrl.deleteJob)

router.get('/jobs/:id/applicants',       ctrl.listApplicants)
router.patch('/applications/:id/status', validate(applicationStatusSchema), ctrl.updateAppStatus)
router.get('/applications/:id/resume',   ctrl.getApplicantResume)
router.get('/applications/:id/cv-file',  ctrl.downloadApplicantCv)

export default router
