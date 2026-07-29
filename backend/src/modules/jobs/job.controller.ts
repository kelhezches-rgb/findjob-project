import { Request, Response } from 'express'
import * as svc from './job.service'
import { AuthRequest } from '../../types'

export const search = async (req: Request, res: Response) => {
  try { res.json(await svc.searchJobs(req.query)) }
  catch (e) { res.status(400).json({ message: (e as Error).message }) }
}

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    // Pass userId if logged-in seeker — service uses it to compute hasApplied
    const userId = req.user?.role === 'seeker' ? req.user.userId : undefined
    res.json({ job: await svc.getJobById(req.params.id, userId) })
  }
  catch (e) { res.status(404).json({ message: (e as Error).message }) }
}

export const apply = async (req: AuthRequest, res: Response) => {
  try {
    const app = await svc.applyToJob(req.user!.userId, req.params.id, req.body)
    res.status(201).json({ application: app })
  } catch (e) {
    const msg = (e as Error).message
    res.status(msg === 'Already applied to this job' ? 409 : 400).json({ message: msg })
  }
}

export const categories = async (_req: Request, res: Response) => {
  try { res.json({ categories: await svc.getCategories() }) }
  catch (e) { res.status(500).json({ message: (e as Error).message }) }
}
