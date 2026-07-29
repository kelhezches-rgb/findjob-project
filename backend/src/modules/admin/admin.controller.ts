import { Request, Response } from 'express'
import * as svc from './admin.service'

const ok  = (res: Response, data: any, status = 200) => res.status(status).json(data)
const err = (res: Response, e: unknown, status = 400) =>
  res.status(status).json({ message: (e as Error).message })

export const getStats = async (_req: Request, res: Response) => {
  try { ok(res, { stats: await svc.getStats() }) } catch (e) { err(res, e, 500) }
}

export const listUsers = async (req: Request, res: Response) => {
  try {
    ok(res, await svc.listUsers({
      page:  Number(req.query.page  || 1),
      limit: Number(req.query.limit || 20),
      q:     req.query.q    as string | undefined,
      role:  req.query.role as string | undefined,
    }))
  } catch (e) { err(res, e) }
}

export const updateUser = async (req: Request, res: Response) => {
  try { ok(res, { user: await svc.updateUser(req.params.id, req.body) }) } catch (e) { err(res, e) }
}

export const deleteUser = async (req: Request, res: Response) => {
  try { await svc.deleteUser(req.params.id); ok(res, { message: 'User deleted' }) } catch (e) { err(res, e) }
}

export const listJobs = async (req: Request, res: Response) => {
  try {
    ok(res, await svc.listAllJobs({
      page:   Number(req.query.page   || 1),
      limit:  Number(req.query.limit  || 20),
      q:      req.query.q      as string | undefined,
      status: req.query.status as string | undefined,
    }))
  } catch (e) { err(res, e) }
}

export const setJobStatus = async (req: Request, res: Response) => {
  try { ok(res, { job: await svc.adminSetJobStatus(req.params.id, req.body.status) }) } catch (e) { err(res, e) }
}

export const deleteJob = async (req: Request, res: Response) => {
  try { await svc.adminDeleteJob(req.params.id); ok(res, { message: 'Job deleted' }) } catch (e) { err(res, e) }
}

export const listCompanies = async (req: Request, res: Response) => {
  try {
    ok(res, await svc.listCompanies({
      page:  Number(req.query.page  || 1),
      limit: Number(req.query.limit || 20),
      q:     req.query.q as string | undefined,
    }))
  } catch (e) { err(res, e) }
}

export const verifyCompany = async (req: Request, res: Response) => {
  try {
    ok(res, { company: await svc.verifyCompany(req.params.id, req.body.isVerified) })
  } catch (e) { err(res, e) }
}
