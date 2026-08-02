import prisma from '../../config/db'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'
import { generateToken, tokenExpiry } from '../../utils/token'

const RECOVERY_WINDOW_DAYS = 15

const sanitize = (user: any) => {
  const { passwordHash, verifyToken, resetToken,
          verifyTokenExpiresAt, resetTokenExpiresAt,
          recoveryToken, recoveryTokenExpiresAt, ...u } = user
  return u
}

// Basic audit trail via server logs (this project has no persisted
// AuditLog table — see chat report). Swap for a real table/log sink later
// if structured, queryable audit history is needed.
const auditLog = (event: string, userId: string, extra: Record<string, unknown> = {}) => {
  console.log(`[Audit] ${event}`, { userId, at: new Date().toISOString(), ...extra })
}

export const requestDeletion = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  // Prevent duplicate/repeated deletion requests (requirement 8).
  if (user.accountStatus === 'PENDING_DELETION') {
    throw new Error('Account deletion has already been requested')
  }
  if (user.accountStatus === 'DELETED') {
    throw new Error('Account not found')
  }

  const deletionRequestedAt = new Date()
  const deletionScheduledAt = new Date(deletionRequestedAt)
  deletionScheduledAt.setDate(deletionScheduledAt.getDate() + RECOVERY_WINDOW_DAYS)

  await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: 'PENDING_DELETION',
      deletionRequestedAt,
      deletionScheduledAt,
      // Flips the same gate login()/refresh()/authenticate middleware
      // already check, so protected access is revoked immediately.
      isActive: false,
    },
  })

  auditLog('deletion requested', userId, { deletionScheduledAt })
  return { deletionScheduledAt }
}

export const recoverAccount = async (recoveryToken: string) => {
  const user = await prisma.user.findFirst({
    where: { recoveryToken, recoveryTokenExpiresAt: { gt: new Date() } },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })
  if (!user) throw new Error('Invalid or expired recovery token')
  if (user.accountStatus !== 'PENDING_DELETION') throw new Error('Account is not pending deletion')

  const restored = await prisma.user.update({
    where: { id: user.id },
    data: {
      accountStatus: 'ACTIVE',
      isActive: true,
      deletionRequestedAt: null,
      deletionScheduledAt: null,
      deletedAt: null,
      recoveryToken: null,
      recoveryTokenExpiresAt: null,
      lastLoginAt: new Date(),
    },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })

  auditLog('account recovered', user.id)

  // Recovery completes the login that was paused — issue a normal session.
  const p = { userId: restored.id, role: restored.role as any }
  return { user: sanitize(restored), accessToken: signAccessToken(p), refreshToken: signRefreshToken(p) }
}

export const getDeletionStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountStatus: true, deletionRequestedAt: true, deletionScheduledAt: true },
  })
  if (!user) throw new Error('User not found')
  return user
}
