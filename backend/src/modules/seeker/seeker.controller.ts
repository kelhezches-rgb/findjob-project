import { Response } from 'express'
import * as svc from './seeker.service'
import { AuthRequest } from '../../types'

const ok  = (res: Response, data: any, status = 200) => res.status(status).json(data)
const err = (res: Response, e: unknown, status = 400) =>
  res.status(status).json({ message: (e as Error).message })

export const getProfile     = async (req: AuthRequest, res: Response) => {
  try { ok(res, { profile: await svc.getProfile(req.user!.userId) }) } catch (e) { err(res, e, 404) }
}
export const updateProfile  = async (req: AuthRequest, res: Response) => {
  try { ok(res, { profile: await svc.updateProfile(req.user!.userId, req.body) }) } catch (e) { err(res, e) }
}
export const listResumes    = async (req: AuthRequest, res: Response) => {
  try { ok(res, { resumes: await svc.listResumes(req.user!.userId) }) } catch (e) { err(res, e) }
}
export const getResume      = async (req: AuthRequest, res: Response) => {
  try { ok(res, { resume: await svc.getResume(req.user!.userId, req.params.id) }) } catch (e) { err(res, e, 404) }
}
export const createResume   = async (req: AuthRequest, res: Response) => {
  try { ok(res, { resume: await svc.createResume(req.user!.userId, req.body) }, 201) } catch (e) { err(res, e) }
}
export const updateResume   = async (req: AuthRequest, res: Response) => {
  try { ok(res, { resume: await svc.updateResume(req.user!.userId, req.params.id, req.body) }) } catch (e) { err(res, e) }
}
export const deleteResume   = async (req: AuthRequest, res: Response) => {
  try { await svc.deleteResume(req.user!.userId, req.params.id); ok(res, { message: 'Deleted' }) } catch (e) { err(res, e) }
}
export const listCvFiles   = async (req: AuthRequest, res: Response) => {
  try { ok(res, { cvFiles: await svc.listCvFiles(req.user!.userId) }) } catch (e) { err(res, e) }
}
export const uploadCv      = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return }
    ok(res, { resume: await svc.uploadCvToResume(req.user!.userId, req.params.resumeId, req.file) }, 201)
  } catch (e) { err(res, e) }
}
export const deleteCv      = async (req: AuthRequest, res: Response) => {
  try { ok(res, { resume: await svc.removeCvFromResume(req.user!.userId, req.params.id) }) } catch (e) { err(res, e) }
}
export const listApplications = async (req: AuthRequest, res: Response) => {
  try { ok(res, { applications: await svc.listApplications(req.user!.userId) }) } catch (e) { err(res, e) }
}
export const listSavedJobs  = async (req: AuthRequest, res: Response) => {
  try { ok(res, { savedJobs: await svc.listSavedJobs(req.user!.userId) }) } catch (e) { err(res, e) }
}
export const saveJob        = async (req: AuthRequest, res: Response) => {
  try { ok(res, await svc.saveJob(req.user!.userId, req.params.jobId), 201) } catch (e) { err(res, e) }
}
export const unsaveJob      = async (req: AuthRequest, res: Response) => {
  try { await svc.unsaveJob(req.user!.userId, req.params.jobId); ok(res, { message: 'Removed' }) } catch (e) { err(res, e) }
}
