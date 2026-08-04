import path from 'path'
import fs from 'fs'
import prisma from '../../config/db'
import { paginate, paginationMeta } from '../../utils/pagination'

const getEmployer = async (userId: string) => {
  const e = await prisma.employer.findUnique({ where: { userId }, include: { company: true } })
  if (!e) throw new Error('Employer profile not found')
  return e
}

// Called only from write/management actions below (create/update job,
// update company profile, upload logo/cover) — never from read-only
// functions like getProfile/listJobs/listApplicants, so an employer whose
// company was admin-deleted can still SEE their existing data, just can't
// make new changes. Requirement 3: "block employer users linked only to
// that company from company-management actions."
const assertCompanyActive = (emp: { company: { isActive: boolean } }) => {
  if (!emp.company.isActive) {
    throw new Error('This company has been deactivated and can no longer be managed')
  }
}

// ── Company Profile ──────────────────────────────────────────
export const getProfile = async (userId: string) => {
  return getEmployer(userId)
}

export const updateProfile = async (userId: string, data: {
  companyName?: string; logoUrl?: string | null; coverImageUrl?: string | null; website?: string
  industry?: string; size?: string; description?: string
  address?: string; province?: string; position?: string
}) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)
  const { position, companyName, ...companyData } = data
  await prisma.company.update({
    where: { id: emp.companyId },
    data: { ...companyData, ...(companyName && { name: companyName }) },
  })
  if (position) await prisma.employer.update({ where: { userId }, data: { position } })
  return getEmployer(userId)
}

// Shared by uploadLogo/uploadCover — field picks which Company column to write.
export const uploadCompanyImage = async (
  userId: string,
  field: 'logoUrl' | 'coverImageUrl',
  file: Express.Multer.File
) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)

  // Best-effort cleanup of the previous image (only ever a local /uploads/ path)
  const previousUrl = emp.company[field]
  if (previousUrl) {
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(previousUrl))
    fs.unlink(filePath, () => {})
  }

  await prisma.company.update({
    where: { id: emp.companyId },
    data: { [field]: `/uploads/${file.filename}` },
  })
  return getEmployer(userId)
}

// ── Jobs ─────────────────────────────────────────────────────
export const listJobs = async (userId: string, params: { page: number; limit: number; status?: string }) => {
  const emp = await getEmployer(userId)
  const where = {
    companyId: emp.companyId,
    ...(params.status && { status: params.status as any }),
  }
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      ...paginate(params.page, params.limit),
      include: {
        category: { select: { name: true } },
        _count:   { select: { applications: true } },
      },
    }),
    prisma.job.count({ where }),
  ])
  return { jobs, pagination: paginationMeta(total, params.page, params.limit) }
}

export const getJob = async (userId: string, id: string) => {
  const emp = await getEmployer(userId)
  const job = await prisma.job.findFirst({
    where: { id, companyId: emp.companyId },
    include: { category: true, _count: { select: { applications: true } } },
  })
  if (!job) throw new Error('Job not found')
  return job
}

export const createJob = async (userId: string, input: any) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)
  return prisma.job.create({
    data: {
      ...input,
      companyId:   emp.companyId,
      postedById:  emp.id,
      publishedAt: input.status === 'active' ? new Date() : undefined,
    },
    include: { category: true },
  })
}

export const updateJob = async (userId: string, id: string, input: any) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)
  const existing = await prisma.job.findFirst({ where: { id, companyId: emp.companyId } })
  if (!existing) throw new Error('Job not found')
  const wasPublished = existing.status !== 'active' && input.status === 'active'
  return prisma.job.update({
    where: { id },
    data: {
      ...input,
      ...(wasPublished && { publishedAt: new Date() }),
    },
    include: { category: true },
  })
}

export const setJobStatus = async (userId: string, id: string, status: string) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)
  const existing = await prisma.job.findFirst({ where: { id, companyId: emp.companyId } })
  if (!existing) throw new Error('Job not found')
  return prisma.job.update({
    where: { id },
    data: {
      status: status as any,
      ...(status === 'active' && !existing.publishedAt && { publishedAt: new Date() }),
    },
  })
}

export const deleteJob = async (userId: string, id: string) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)
  const existing = await prisma.job.findFirst({ where: { id, companyId: emp.companyId } })
  if (!existing) throw new Error('Job not found')
  await prisma.job.delete({ where: { id } })
}

// ── Applicants ───────────────────────────────────────────────
export const listApplicants = async (userId: string, jobId: string, params: {
  page: number; limit: number; status?: string
}) => {
  const emp = await getEmployer(userId)
  const job = await prisma.job.findFirst({ where: { id: jobId, companyId: emp.companyId } })
  if (!job) throw new Error('Job not found')

  const where = {
    jobId,
    ...(params.status && { status: params.status as any }),
  }
  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      ...paginate(params.page, params.limit),
      include: {
        jobSeeker: {
          select: {
            firstName: true, lastName: true, phone: true,
            avatarUrl: true, headline: true,
          },
        },
        resume: { select: { id: true, title: true, cvFileUrl: true, cvFileName: true } },
      },
    }),
    prisma.application.count({ where }),
  ])
  return { applications, pagination: paginationMeta(total, params.page, params.limit) }
}

// Shared authorization core for both resume-detail and CV-file access below.
// Scoped through the APPLICATION id (which the employer already only ever
// sees for applications on their own jobs, via listApplicants above) —
// never trusts a bare resumeId/jobId/filePath sent from the frontend.
// Throws a tagged error so the controller can map it to 403 vs 404.
class ApplicantAccessError extends Error {
  constructor(message: string, public status: 403 | 404) { super(message) }
}

const getAuthorizedApplication = async (userId: string, applicationId: string) => {
  const emp = await getEmployer(userId)
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, resume: true },
  })
  if (!application) throw new ApplicantAccessError('Application not found', 404)
  if (application.job.companyId !== emp.companyId) {
    throw new ApplicantAccessError('You do not have access to this application', 403)
  }
  return application
}

export const getApplicantResume = async (userId: string, applicationId: string) => {
  const application = await getAuthorizedApplication(userId, applicationId)
  if (!application.resume) throw new ApplicantAccessError('No resume submitted for this application', 404)
  return application.resume
}

// Deliberately a tight, explicit `select` (never `include`) — this is the
// literal enforcement of "return only fields needed for recruitment":
// passwordHash, verifyToken/resetToken/recoveryToken and their expiries,
// isActive, accountStatus, deletion fields are never selected here at all,
// not merely stripped afterward. Ownership check is the same as above.
export const getApplicantDetail = async (userId: string, applicationId: string) => {
  const emp = await getEmployer(userId)
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true, status: true, coverLetter: true, employerNote: true,
      appliedAt: true, reviewedAt: true,
      job: { select: { id: true, title: true, companyId: true } },
      resume: {
        select: {
          id: true, title: true, summary: true,
          experiences: true, educations: true, skills: true, languages: true,
          cvFileUrl: true, cvFileName: true, expectedSalary: true,
        },
      },
      jobSeeker: {
        select: {
          firstName: true, lastName: true, phone: true, avatarUrl: true,
          headline: true, bio: true,
          user: { select: { email: true } },
        },
      },
    },
  })
  if (!application) throw new ApplicantAccessError('Application not found', 404)
  if (application.job.companyId !== emp.companyId) {
    throw new ApplicantAccessError('You do not have access to this application', 403)
  }
  return application
}

// Returns the absolute, sanitized on-disk path for the CV file (never the
// raw DB value) — path.basename() strips any directory components, so a
// malicious cvFileUrl value could never traverse outside the upload dir.
export const getApplicantCvFilePath = async (userId: string, applicationId: string) => {
  const application = await getAuthorizedApplication(userId, applicationId)
  if (!application.resume?.cvFileUrl) throw new ApplicantAccessError('No CV file for this application', 404)

  const uploadDir = process.env.UPLOAD_DIR || 'uploads'
  const filename = path.basename(application.resume.cvFileUrl)
  const filePath = path.join(process.cwd(), uploadDir, filename)

  if (!fs.existsSync(filePath)) throw new ApplicantAccessError('CV file not found on server', 404)
  return { filePath, fileName: application.resume.cvFileName || filename }
}

export { ApplicantAccessError }

export const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  input: { status: string; employerNote?: string }
) => {
  const emp = await getEmployer(userId)
  assertCompanyActive(emp)
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  })
  if (!app || app.job.companyId !== emp.companyId) throw new Error('Application not found')

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      status:       app.status !== input.status ? (input.status as any) : app.status,
      employerNote: input.employerNote,
      reviewedAt:   new Date(),
    },
  })
}
