import prisma from '../../config/db'
import { paginate, paginationMeta } from '../../utils/pagination'

// ── Dashboard Stats ──────────────────────────────────────────
export const getStats = async () => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [
    totalUsers, totalJobs, totalCompanies, totalApplications,
    activeJobs, newUsersThisMonth,
    jobsByStatus, appsByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.job.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.job.groupBy({ by: ['status'], _count: true }),
    prisma.application.groupBy({ by: ['status'], _count: true }),
  ])

  return {
    totalUsers, totalJobs, totalCompanies, totalApplications,
    activeJobs, newUsersThisMonth,
    jobsByStatus:  Object.fromEntries(jobsByStatus.map(r => [r.status, r._count])),
    appsByStatus:  Object.fromEntries(appsByStatus.map(r => [r.status, r._count])),
  }
}

// ── Users ─────────────────────────────────────────────────────
export const listUsers = async (params: {
  page: number; limit: number; q?: string; role?: string
}) => {
  const where: any = {}
  if (params.role) where.role = params.role
  if (params.q)    where.email = { contains: params.q, mode: 'insensitive' }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      ...paginate(params.page, params.limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, isActive: true,
        isVerified: true, createdAt: true, lastLoginAt: true,
        jobSeeker: { select: { firstName: true, lastName: true } },
        employer:  { select: { company: { select: { name: true } } } },
      },
    }),
    prisma.user.count({ where }),
  ])
  return { users, pagination: paginationMeta(total, params.page, params.limit) }
}

export const updateUser = async (id: string, data: {
  isActive?: boolean; role?: string
}) => {
  return prisma.user.update({
    where: { id },
    data: { ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.role && { role: data.role as any }) },
    select: { id: true, email: true, role: true, isActive: true },
  })
}

export const deleteUser = async (id: string) => {
  await prisma.user.delete({ where: { id } })
}

// ── Jobs ─────────────────────────────────────────────────────
export const listAllJobs = async (params: {
  page: number; limit: number; q?: string; status?: string
}) => {
  const where: any = {}
  if (params.status) where.status = params.status
  if (params.q)      where.title  = { contains: params.q, mode: 'insensitive' }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      ...paginate(params.page, params.limit),
      orderBy: { createdAt: 'desc' },
      include: {
        company:  { select: { name: true } },
        category: { select: { name: true } },
        _count:   { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ])
  return { jobs, pagination: paginationMeta(total, params.page, params.limit) }
}

export const adminSetJobStatus = async (id: string, status: string) => {
  return prisma.job.update({ where: { id }, data: { status: status as any } })
}

export const adminDeleteJob = async (id: string) => {
  await prisma.job.delete({ where: { id } })
}

// ── Companies ────────────────────────────────────────────────
export const listCompanies = async (params: {
  page: number; limit: number; q?: string
}) => {
  const where: any = {}
  if (params.q) where.name = { contains: params.q, mode: 'insensitive' }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      ...paginate(params.page, params.limit),
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { jobs: true, employers: true } } },
    }),
    prisma.company.count({ where }),
  ])
  return { companies, pagination: paginationMeta(total, params.page, params.limit) }
}

export const verifyCompany = async (id: string, isVerified: boolean) => {
  return prisma.company.update({ where: { id }, data: { isVerified } })
}
