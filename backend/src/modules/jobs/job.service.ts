import prisma from '../../config/db'
import { Prisma } from '@prisma/client'
import { paginate, paginationMeta } from '../../utils/pagination'

const activeWhere = (): Prisma.JobWhereInput => ({
  status: 'active',
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
})

const SORT_OPTIONS: Record<string, Prisma.JobOrderByWithRelationInput[]> = {
  latest:      [{ createdAt: 'desc' }],
  oldest:      [{ createdAt: 'asc' }],
  salary_desc: [{ salaryMax: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  salary_asc:  [{ salaryMin: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
}

export const searchJobs = async (q: any) => {
  const where: Prisma.JobWhereInput = {
    ...activeWhere(),
    ...(q.province && { province: { contains: q.province, mode: 'insensitive' } }),
    // Job has no dedicated district/subDistrict columns (see jobQuerySchema
    // comment) — reuse the existing free-text `location` field. This is a
    // best-effort refinement, not a strict match: it only narrows results
    // whose location text happens to mention that area. A future schema
    // change (adding district/subDistrict columns to Job, populated from
    // the same 77-province dataset) would make this exact instead.
    ...((q.district || q.subDistrict) && {
      AND: [
        ...(q.district    ? [{ location: { contains: q.district,    mode: 'insensitive' as const } }] : []),
        ...(q.subDistrict ? [{ location: { contains: q.subDistrict, mode: 'insensitive' as const } }] : []),
      ],
    }),
    ...(q.jobType    && { jobType:   q.jobType }),
    ...(q.categoryId && { categoryId: q.categoryId }),
    ...(q.isRemote !== undefined && { isRemote: q.isRemote }),
    ...(q.experienceLevel && { experienceLevel: q.experienceLevel }),
    // COMPANY_STRUCTURE jobs always have salaryMin/salaryMax = null (never
    // 0 — see validators/index.ts stripSalaryForCompanyStructure), so a
    // numeric salary filter here naturally excludes them (SQL: NULL >= x is
    // never true) rather than wrongly matching them as "salary 0". This is
    // the documented behavior for requirement 6: an active salaryMin/
    // salaryMax filter excludes COMPANY_STRUCTURE jobs from results. With
    // no salary filter active, they appear in results normally, and sort
    // to the end (nulls: 'last') when sorting by salary.
    ...(q.salaryMin && { salaryMin: { gte: q.salaryMin } }),
    ...(q.salaryMax && { salaryMax: { lte: q.salaryMax } }),
    ...(q.q && {
      OR: [
        { title:       { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
        { company:     { name: { contains: q.q, mode: 'insensitive' } } },
      ],
    }),
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: SORT_OPTIONS[q.sort as string] || SORT_OPTIONS.latest,
      ...paginate(q.page, q.limit),
      include: {
        company:  { select: { id: true, name: true, logoUrl: true, industry: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count:   { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ])

  return { jobs, pagination: paginationMeta(total, q.page, q.limit) }
}

export const getJobById = async (id: string, userId?: string) => {
  const job = await prisma.job.findFirst({
    where: { id, ...activeWhere() },
    include: {
      company:  true,
      category: true,
      postedBy: { select: { position: true, user: { select: { email: true } } } },
      _count:   { select: { applications: true } },
    },
  })
  if (!job) throw new Error('Job not found')
  await prisma.job.update({ where: { id }, data: { viewsCount: { increment: 1 } } })

  // Check if the authenticated seeker has already applied — resolves Known Issue #4
  let hasApplied = false
  if (userId) {
    const seeker = await prisma.jobSeeker.findUnique({ where: { userId } })
    if (seeker) {
      const existing = await prisma.application.findUnique({
        where: { jobSeekerId_jobId: { jobSeekerId: seeker.id, jobId: id } },
      })
      hasApplied = Boolean(existing)
    }
  }

  return { ...job, hasApplied }
}

export const applyToJob = async (userId: string, jobId: string, input: {
  resumeId?: string; coverLetter?: string
}) => {
  const seeker = await prisma.jobSeeker.findUnique({ where: { userId } })
  if (!seeker) throw new Error('Job seeker profile not found')

  const job = await prisma.job.findFirst({ where: { id: jobId, ...activeWhere() } })
  if (!job) throw new Error('Job not found or no longer active')

  if (input.resumeId) {
    const resume = await prisma.resume.findFirst({ where: { id: input.resumeId, jobSeekerId: seeker.id } })
    if (!resume) throw new Error('Resume not found')
  }

  const existing = await prisma.application.findUnique({
    where: { jobSeekerId_jobId: { jobSeekerId: seeker.id, jobId } },
  })
  if (existing) throw new Error('Already applied to this job')

  return prisma.application.create({
    data: { jobSeekerId: seeker.id, jobId, resumeId: input.resumeId, coverLetter: input.coverLetter },
  })
}

// Ordered by group first so the frontend can render <optgroup> sections
// without having to re-sort client-side.
export const getCategories = async () =>
  prisma.category.findMany({ orderBy: [{ group: 'asc' }, { name: 'asc' }] })
