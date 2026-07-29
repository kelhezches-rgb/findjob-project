import crypto from 'crypto'
export const generateToken = (bytes = 32): string => crypto.randomBytes(bytes).toString('hex')
export const tokenExpiry   = (hours: number): Date => {
  const d = new Date(); d.setHours(d.getHours() + hours); return d
}
