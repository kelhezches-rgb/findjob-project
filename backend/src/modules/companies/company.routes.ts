import { Router } from 'express'
import * as ctrl from './company.controller'

const router = Router()

router.get('/:id', ctrl.getOne)

export default router
