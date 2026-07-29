import { Request, Response } from 'express'
import * as svc from './company.service'

export const getOne = async (req: Request, res: Response) => {
  try { res.json(await svc.getCompanyById(req.params.id)) }
  catch (e) { res.status(404).json({ message: (e as Error).message }) }
}
