import prisma from '../../config/db'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt'
import { sendEmail, buildVerificationEmail, buildPasswordResetEmail } from '../../utils/email'
import { generateToken, tokenExpiry } from '../../utils/token'

type RegisterInput = {
  email: string; password: string; role: 'seeker' | 'employer'
  firstName?: string; lastName?: string; companyName?: string; position?: string
}

const sanitize = (user: any) => {
  const { passwordHash, verifyToken, resetToken,
          verifyTokenExpiresAt, resetTokenExpiresAt,
          recoveryToken, recoveryTokenExpiresAt, ...u } = user
  return u
}

export const register = async (input: RegisterInput) => {
  if (await prisma.user.findUnique({ where: { email: input.email } }))
    throw new Error('Email already registered')

  const passwordHash = await bcrypt.hash(input.password, 12)
  const verifyToken  = generateToken()
  const verifyExpiry = tokenExpiry(24)

  const user = await prisma.user.create({
    data: {
      email: input.email, passwordHash, role: input.role,
      verifyToken, verifyTokenExpiresAt: verifyExpiry,
      ...(input.role === 'seeker'
        ? { jobSeeker: { create: { firstName: input.firstName!, lastName: input.lastName! } } }
        : { employer: { create: { position: input.position, company: { create: { name: input.companyName! } } } } }),
    },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const verifyUrl = `${clientUrl}/verify-email?token=${verifyToken}`
  const firstName = user.jobSeeker?.firstName || input.companyName || 'คุณ'
  sendEmail({ to: user.email, ...buildVerificationEmail(firstName, verifyUrl) })
    .catch(err => console.error('[Email]', err.message))

  const p = { userId: user.id, role: user.role as any }
  return { user: sanitize(user), accessToken: signAccessToken(p), refreshToken: signRefreshToken(p) }
}

export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyTokenExpiresAt: { gt: new Date() } },
  })
  if (!user) throw new Error('Invalid or expired verification link')
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null, verifyTokenExpiresAt: null },
  })
}

export const resendVerification = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })
  if (!user) throw new Error('User not found')
  if (user.isVerified) throw new Error('Email is already verified')

  const verifyToken  = generateToken()
  const verifyExpiry = tokenExpiry(24)
  await prisma.user.update({ where: { id: user.id }, data: { verifyToken, verifyTokenExpiresAt: verifyExpiry } })

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const verifyUrl = `${clientUrl}/verify-email?token=${verifyToken}`
  const firstName = user.jobSeeker?.firstName || user.employer?.company?.name || 'คุณ'
  await sendEmail({ to: user.email, ...buildVerificationEmail(firstName, verifyUrl) })
}

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })
  if (!user || !user.isActive) return   // silent — never reveal email existence

  const resetToken  = generateToken()
  const resetExpiry = tokenExpiry(1)
  await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiresAt: resetExpiry } })

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
  const resetUrl  = `${clientUrl}/reset-password?token=${resetToken}`
  const firstName = user.jobSeeker?.firstName || user.employer?.company?.name || 'คุณ'
  await sendEmail({ to: user.email, ...buildPasswordResetEmail(firstName, resetUrl) })
}

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiresAt: { gt: new Date() } },
  })
  if (!user) throw new Error('Invalid or expired reset link')
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  })
}

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })
  if (!user) throw new Error('Invalid email or password')
  if (!await bcrypt.compare(password, user.passwordHash)) throw new Error('Invalid email or password')

  if (user.accountStatus === 'PENDING_DELETION') {
    if (user.deletionScheduledAt && user.deletionScheduledAt.getTime() <= Date.now()) {
      // Requirement 5: after the 15-day deadline, normal login is blocked.
      throw new Error('This account is past its recovery period and can no longer be restored by logging in.')
    }
    // Don't grant a normal session yet — issue a short-lived recovery
    // token instead, same pattern as verifyToken/resetToken. The frontend
    // shows the recovery screen; only /api/account/recover (using this
    // token) actually restores access.
    const recoveryToken = generateToken()
    await prisma.user.update({
      where: { id: user.id },
      data: { recoveryToken, recoveryTokenExpiresAt: tokenExpiry(1) },
    })
    return {
      requiresAccountRecovery: true as const,
      deletionScheduledAt: user.deletionScheduledAt,
      recoveryToken,
    }
  }

  if (!user.isActive) throw new Error('Account is deactivated')
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  const p = { userId: user.id, role: user.role as any }
  return { user: sanitize(user), accessToken: signAccessToken(p), refreshToken: signRefreshToken(p) }
}

export const refresh = async (token: string) => {
  const payload = verifyRefreshToken(token)
  const user    = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || !user.isActive || user.accountStatus !== 'ACTIVE') throw new Error('User not found')
  return { accessToken: signAccessToken({ userId: user.id, role: user.role as any }) }
}

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { jobSeeker: true, employer: { include: { company: true } } },
  })
  if (!user || user.accountStatus !== 'ACTIVE') throw new Error('User not found')
  return sanitize(user)
}
