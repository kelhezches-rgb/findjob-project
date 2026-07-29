import prisma from '../../config/db'

// Kept in sync with jobs/job.service.ts's activeWhere — a job is publicly
// visible only while it's active and not yet expired.
const activeJobWhere = () => ({
  status: 'active' as const,
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
})

export const getCompanyById = async (id: string) => {
  const company = await prisma.company.findUnique({
    where: { id },
    include: { _count: { select: { jobs: { where: activeJobWhere() } } } },
  })
  if (!company) throw new Error('Company not found')

  const jobs = await prisma.job.findMany({
    where: { companyId: id, ...activeJobWhere() },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      company:  { select: { id: true, name: true, logoUrl: true, industry: true } },
      category: { select: { id: true, name: true, slug: true } },
      _count:   { select: { applications: true } },
    },
  })

  return { company, jobs }
}
