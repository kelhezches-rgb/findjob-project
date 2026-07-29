import prisma from '../../config/db'
import fs from 'fs'
import path from 'path'

// ── Helpers ──────────────────────────────────────────────────
const getSeekerId = async (userId: string) => {
  const s = await prisma.jobSeeker.findUnique({ where: { userId } })
  if (!s) throw new Error('Job seeker profile not found')
  return s.id
}

// ── Profile ──────────────────────────────────────────────────
export const getProfile = async (userId: string) => {
  const p = await prisma.jobSeeker.findUnique({ where: { userId } })
  if (!p) throw new Error('Profile not found')
  return p
}

export const updateProfile = async (userId: string, data: {
  firstName?: string; lastName?: string; phone?: string
  headline?: string; bio?: string; dateOfBirth?: string
}) => {
  return prisma.jobSeeker.update({
    where: { userId },
    data: { ...data, dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined },
  })
}

// ── Resumes ──────────────────────────────────────────────────
export const listResumes = async (userId: string) => {
  const jobSeekerId = await getSeekerId(userId)
  return prisma.resume.findMany({ where: { jobSeekerId }, orderBy: { updatedAt: 'desc' } })
}

export const getResume = async (userId: string, id: string) => {
  const jobSeekerId = await getSeekerId(userId)
  const r = await prisma.resume.findFirst({ where: { id, jobSeekerId } })
  if (!r) throw new Error('Resume not found')
  return r
}

export const createResume = async (userId: string, input: any) => {
  const jobSeekerId = await getSeekerId(userId)
  if (input.isPrimary) {
    await prisma.resume.updateMany({ where: { jobSeekerId, isPrimary: true }, data: { isPrimary: false } })
  }
  return prisma.resume.create({ data: { jobSeekerId, ...input } })
}

export const updateResume = async (userId: string, id: string, input: any) => {
  const jobSeekerId = await getSeekerId(userId)
  const existing = await prisma.resume.findFirst({ where: { id, jobSeekerId } })
  if (!existing) throw new Error('Resume not found')
  if (input.isPrimary) {
    await prisma.resume.updateMany({ where: { jobSeekerId, isPrimary: true, NOT: { id } }, data: { isPrimary: false } })
  }
  return prisma.resume.update({ where: { id }, data: input })
}

export const deleteResume = async (userId: string, id: string) => {
  const jobSeekerId = await getSeekerId(userId)
  const existing = await prisma.resume.findFirst({ where: { id, jobSeekerId } })
  if (!existing) throw new Error('Resume not found')
  await prisma.resume.delete({ where: { id } })
}

// ── CV Files ─────────────────────────────────────────────────
// Standalone PDF uploads — not tied to a specific resume.
// The uploaded file info is stored on whichever resume the seeker
// selects at apply time (or on the primary resume by default).

export const listCvFiles = async (userId: string) => {
  const seeker = await prisma.jobSeeker.findUnique({ where: { userId } })
  if (!seeker) throw new Error('Job seeker profile not found')

  return prisma.resume.findMany({
    where: {
      jobSeekerId: seeker.id,
      cvFileUrl: { not: null },
    },
    select: {
      id: true,
      title: true,
      cvFileUrl: true,
      cvFileName: true,
      cvFileSize: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export const uploadCvToResume = async (
  userId: string,
  resumeId: string,
  file: Express.Multer.File
) => {
  const seeker = await prisma.jobSeeker.findUnique({ where: { userId } })
  if (!seeker) throw new Error('Job seeker profile not found')

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, jobSeekerId: seeker.id },
  })
  if (!resume) throw new Error('Resume not found')

  return prisma.resume.update({
    where: { id: resumeId },
    data: {
      cvFileUrl:  `/uploads/${file.filename}`,
      cvFileName: file.originalname,
      cvFileSize: file.size,
    },
  })
}

export const removeCvFromResume = async (userId: string, resumeId: string) => {
  const seeker = await prisma.jobSeeker.findUnique({ where: { userId } })
  if (!seeker) throw new Error('Job seeker profile not found')

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, jobSeekerId: seeker.id },
  })
  if (!resume) throw new Error('Resume not found')

  // Best-effort physical file cleanup
  if (resume.cvFileUrl) {
    const filePath = path.join(
      process.env.UPLOAD_DIR || 'uploads',
      path.basename(resume.cvFileUrl)
    )
    fs.unlink(filePath, () => {})
  }

  return prisma.resume.update({
    where: { id: resumeId },
    data: { cvFileUrl: null, cvFileName: null, cvFileSize: null },
  })
}

// ── Applications ─────────────────────────────────────────────
export const listApplications = async (userId: string) => {
  const jobSeekerId = await getSeekerId(userId)
  return prisma.application.findMany({
    where: { jobSeekerId },
    orderBy: { appliedAt: 'desc' },
    include: {
      job: {
        include: {
          company:  { select: { name: true, logoUrl: true } },
          category: { select: { name: true } },
        },
      },
      resume: { select: { id: true, title: true } },
    },
  })
}

// ── Saved Jobs ───────────────────────────────────────────────
export const listSavedJobs = async (userId: string) => {
  const jobSeekerId = await getSeekerId(userId)
  return prisma.savedJob.findMany({
    where: { jobSeekerId },
    orderBy: { savedAt: 'desc' },
    include: {
      job: {
        include: {
          company:  { select: { name: true, logoUrl: true } },
          category: { select: { name: true } },
        },
      },
    },
  })
}

export const saveJob = async (userId: string, jobId: string) => {
  const jobSeekerId = await getSeekerId(userId)
  const job = await prisma.job.findFirst({ where: { id: jobId, status: 'active' } })
  if (!job) throw new Error('Job not found')
  const existing = await prisma.savedJob.findUnique({
    where: { jobSeekerId_jobId: { jobSeekerId, jobId } },
  })
  if (existing) throw new Error('Job already saved')
  return prisma.savedJob.create({ data: { jobSeekerId, jobId } })
}

export const unsaveJob = async (userId: string, jobId: string) => {
  const jobSeekerId = await getSeekerId(userId)
  await prisma.savedJob.deleteMany({ where: { jobSeekerId, jobId } })
}
