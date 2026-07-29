import { Request } from 'express'

export interface AuthPayload {
  userId: string
  role: 'seeker' | 'employer' | 'admin'
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export interface PaginationParams {
  page: number
  limit: number
}
