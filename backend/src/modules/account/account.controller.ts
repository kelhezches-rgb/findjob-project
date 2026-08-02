import { Request, Response } from 'express'
import * as svc from './account.service'
import { AuthRequest } from '../../types'
import { COOKIE } from '../auth/auth.controller'

export const deleteRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { deletionScheduledAt } = await svc.requestDeletion(req.user!.userId)
    // Requirement 3: log the user out after the request succeeds.
    res.clearCookie('refreshToken', { path: '/api/auth', secure: COOKIE.secure, sameSite: COOKIE.sameSite })
    res.status(200).json({
      message: 'Account scheduled for deletion',
      accountStatus: 'PENDING_DELETION',
      deletionScheduledAt,
    })
  } catch (e) { res.status(400).json({ message: (e as Error).message }) }
}

export const recover = async (req: Request, res: Response) => {
  try {
    const { user, accessToken, refreshToken } = await svc.recoverAccount(req.body.recoveryToken)
    res.cookie('refreshToken', refreshToken, COOKIE)
    res.status(200).json({ message: 'Account restored', user, accessToken })
  } catch (e) { res.status(400).json({ message: (e as Error).message }) }
}

export const deletionStatus = async (req: AuthRequest, res: Response) => {
  try { res.status(200).json(await svc.getDeletionStatus(req.user!.userId)) }
  catch (e) { res.status(404).json({ message: (e as Error).message }) }
}
