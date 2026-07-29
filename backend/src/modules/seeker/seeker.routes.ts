import { Router } from 'express'
import * as ctrl from './seeker.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { requireRole } from '../../middlewares/role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { upload } from '../../config/multer'
import { createResumeSchema, updateResumeSchema } from '../../validators'

const router = Router()
router.use(authenticate, requireRole('seeker'))

router.get('/profile', ctrl.getProfile)
router.put('/profile', ctrl.updateProfile)

router.get('/resumes',     ctrl.listResumes)
router.post('/resumes',    validate(createResumeSchema), ctrl.createResume)
router.get('/resumes/:id', ctrl.getResume)
router.put('/resumes/:id', validate(updateResumeSchema), ctrl.updateResume)
router.delete('/resumes/:id', ctrl.deleteResume)

// CV Files
router.get('/cv-files',                    ctrl.listCvFiles)
router.post('/cv-files/:resumeId',         upload.single('file'), ctrl.uploadCv)
router.delete('/cv-files/:id',             ctrl.deleteCv)

router.get('/applications', ctrl.listApplications)

router.get('/saved-jobs',           ctrl.listSavedJobs)
router.post('/saved-jobs/:jobId',   ctrl.saveJob)
router.delete('/saved-jobs/:jobId', ctrl.unsaveJob)

export default router
