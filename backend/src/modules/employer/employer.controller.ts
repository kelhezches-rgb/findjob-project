import { Response } from 'express'
import * as svc from './employer.service'
import { AuthRequest } from '../../types'

const ok  = (res: Response, data: any, status = 200) => res.status(status).json(data)
const err = (res: Response, e: unknown, status = 400) =>
  res.status(status).json({ message: (e as Error).message })

export const getProfile    = async (req: AuthRequest, res: Response) => {
  try { ok(res, { profile: await svc.getProfile(req.user!.userId) }) } catch (e) { err(res, e, 404) }
}
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try { ok(res, { profile: await svc.updateProfile(req.user!.userId, req.body) }) } catch (e) { err(res, e) }
}
export const uploadLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return }
    ok(res, { profile: await svc.uploadCompanyImage(req.user!.userId, 'logoUrl', req.file) }, 201)
  } catch (e) { err(res, e) }
}
export const uploadCover = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return }
    ok(res, { profile: await svc.uploadCompanyImage(req.user!.userId, 'coverImageUrl', req.file) }, 201)
  } catch (e) { err(res, e) }
}
export const listJobs = async (req: AuthRequest, res: Response) => {
  try {
    const page   = Number(req.query.page  || 1)
    const limit  = Number(req.query.limit || 10)
    const status = req.query.status as string | undefined
    ok(res, await svc.listJobs(req.user!.userId, { page, limit, status }))
  } catch (e) { err(res, e) }
}
export const getJob = async (req: AuthRequest, res: Response) => {
  try { ok(res, { job: await svc.getJob(req.user!.userId, req.params.id) }) } catch (e) { err(res, e, 404) }
}
export const createJob = async (req: AuthRequest, res: Response) => {
  try { ok(res, { job: await svc.createJob(req.user!.userId, req.body) }, 201) } catch (e) { err(res, e) }
}
export const updateJob = async (req: AuthRequest, res: Response) => {
  try { ok(res, { job: await svc.updateJob(req.user!.userId, req.params.id, req.body) }) } catch (e) { err(res, e) }
}
export const setStatus = async (req: AuthRequest, res: Response) => {
  try { ok(res, { job: await svc.setJobStatus(req.user!.userId, req.params.id, req.body.status) }) } catch (e) { err(res, e) }
}
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try { await svc.deleteJob(req.user!.userId, req.params.id); ok(res, { message: 'Deleted' }) } catch (e) { err(res, e) }
}
export const listApplicants = async (req: AuthRequest, res: Response) => {
  try {
    const page   = Number(req.query.page   || 1)
    const limit  = Number(req.query.limit  || 20)
    const status = req.query.status as string | undefined
    ok(res, await svc.listApplicants(req.user!.userId, req.params.id, { page, limit, status }))
  } catch (e) { err(res, e) }
}
export const updateAppStatus = async (req: AuthRequest, res: Response) => {
  try {
    ok(res, { application: await svc.updateApplicationStatus(req.user!.userId, req.params.id, req.body) })
  } catch (e) { err(res, e) }
}

const errApplicant = (res: Response, e: unknown) => {
  if (e instanceof svc.ApplicantAccessError) { res.status(e.status).json({ message: e.message }); return }
  err(res, e, 500)
}

export const getApplicantResume = async (req: AuthRequest, res: Response) => {
  try { ok(res, { resume: await svc.getApplicantResume(req.user!.userId, req.params.id) }) }
  catch (e) { errApplicant(res, e) }
}

export const getApplicantDetail = async (req: AuthRequest, res: Response) => {
  try { ok(res, { application: await svc.getApplicantDetail(req.user!.userId, req.params.id) }) }
  catch (e) { errApplicant(res, e) }
}

export const downloadApplicantCv = async (req: AuthRequest, res: Response) => {
  try {
    const { filePath } = await svc.getApplicantCvFilePath(req.user!.userId, req.params.id)
    // sendFile (not download) — no Content-Disposition:attachment, so PDFs
    // open inline in the new tab per requirement 2, rather than forcing a save dialog.
    res.sendFile(filePath, (e) => {
      if (e && !res.headersSent) res.status(404).json({ message: 'CV file not found' })
    })
  } catch (e) { errApplicant(res, e) }
}
