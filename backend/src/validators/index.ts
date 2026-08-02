import { z } from 'zod'

// ── Auth ──────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['seeker', 'employer']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().min(1).optional(),
  position: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'seeker') {
    if (!data.firstName) ctx.addIssue({ code: 'custom', path: ['firstName'], message: 'Required' })
    if (!data.lastName)  ctx.addIssue({ code: 'custom', path: ['lastName'],  message: 'Required' })
  }
  if (data.role === 'employer' && !data.companyName)
    ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Required' })
})

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

// ── Jobs ──────────────────────────────────────────────────────

// [แก้] แยก field ทั้งหมดออกมาเป็น "base" schema ล้วนๆ (ยังเป็น ZodObject)
// โดยยังไม่ผูก .superRefine() เข้ากับตัวนี้ เพื่อให้ยังเรียก .partial() ได้
export const createJobBaseSchema = z.object({
  title:           z.string().min(1),
  description:     z.string().min(1),
  requirements:    z.string().optional(),
  benefits:        z.string().optional(),
  location:        z.string().optional(),
  province:        z.string().optional(),
  isRemote:        z.boolean().default(false),
  jobType:         z.enum(['full_time', 'part_time', 'contract', 'internship', 'remote']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  // COMPANY_STRUCTURE = "ตามโครงสร้างบริษัท" — salary follows the
  // company's own pay scale instead of a posted numeric range. Never store
  // that Thai string directly; the frontend maps salaryType -> label.
  salaryType:      z.enum(['RANGE', 'COMPANY_STRUCTURE']).default('RANGE'),
  salaryMin:       z.number().positive().nullable().optional(),
  salaryMax:       z.number().positive().nullable().optional(),
  categoryId:      z.string().uuid().optional(),
  tags:            z.array(z.string()).default([]),
  status:          z.enum(['draft', 'active']).default('draft'),
  expiresAt:       z.string().datetime().optional(),
})

// [แก้] ดึง refine logic (เช็ค salaryMin <= salaryMax) ออกมาเป็นฟังก์ชันแยก
// เพื่อใช้ซ้ำได้ทั้งตอน create และ update โดยไม่ต้องเขียนซ้ำสองที่
const validateSalaryRange = (
  d: { salaryType?: 'RANGE' | 'COMPANY_STRUCTURE'; salaryMin?: number | null; salaryMax?: number | null },
  ctx: z.RefinementCtx
) => {
  // COMPANY_STRUCTURE has no numeric salary to validate — see requirement 3.
  if (d.salaryType === 'COMPANY_STRUCTURE') return
  if (d.salaryMin && d.salaryMax && d.salaryMin > d.salaryMax)
    ctx.addIssue({ code: 'custom', path: ['salaryMax'], message: 'Max must be ≥ min' })
}

// Belt-and-suspenders: even if the client forgets to clear salaryMin/Max
// when switching to COMPANY_STRUCTURE, never persist stray numeric values
// for that mode (requirement 2 — "Clear any previously entered numeric
// salary values"). No-op for RANGE or when salaryType isn't part of this
// request (partial updates that don't touch salaryType).
const stripSalaryForCompanyStructure = <
  T extends { salaryType?: 'RANGE' | 'COMPANY_STRUCTURE'; salaryMin?: number | null; salaryMax?: number | null }
>(d: T): T =>
  d.salaryType === 'COMPANY_STRUCTURE' ? { ...d, salaryMin: null, salaryMax: null } : d

// [แก้] createJobSchema = base + superRefine — validation ตอน create เหมือนเดิมทุกจุด
export const createJobSchema = createJobBaseSchema.superRefine(validateSalaryRange).transform(stripSalaryForCompanyStructure)

// [แก้] จุดที่พัง (bug เดิม): createJobSchema.partial() error เพราะ .superRefine()
// เปลี่ยน createJobSchema จาก ZodObject เป็น ZodEffects ซึ่งไม่มี .partial()
// ตอนนี้เรียก .partial() จาก createJobBaseSchema (ยังเป็น ZodObject) แทน
// แล้วผูก superRefine ตัวเดียวกันกลับเข้าไป เพื่อคง validation เรื่อง salary ไว้ตอน update ด้วย
export const updateJobSchema = createJobBaseSchema.partial().superRefine(validateSalaryRange).transform(stripSalaryForCompanyStructure)

export const jobStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'closed', 'expired']),
})

export const jobQuerySchema = z.object({
  q:               z.string().optional(),
  location:        z.string().optional(),
  province:        z.string().optional(),
  // No dedicated district/subDistrict columns on Job (see job.service.ts
  // searchJobs for the reasoning) — these are matched against the existing
  // free-text `location` field as a best-effort refinement.
  district:        z.string().optional(),
  subDistrict:     z.string().optional(),
  jobType:         z.enum(['full_time', 'part_time', 'contract', 'internship', 'remote']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  categoryId:      z.string().uuid().optional(),
  salaryMin:       z.coerce.number().optional(),
  salaryMax:       z.coerce.number().optional(),
  isRemote:        z.coerce.boolean().optional(),
  sort:            z.enum(['latest', 'oldest', 'salary_desc', 'salary_asc']).default('latest'),
  page:            z.coerce.number().positive().default(1),
  limit:           z.coerce.number().positive().max(50).default(10),
})

// ── Resume ────────────────────────────────────────────────────
export const createResumeSchema = z.object({
  title:          z.string().min(1),
  summary:        z.string().optional(),
  isPrimary:      z.boolean().default(false),
  expectedSalary: z.number().positive().optional(),
  experiences:    z.array(z.object({
    company:     z.string().min(1),
    position:    z.string().min(1),
    startDate:   z.string(),
    endDate:     z.string().optional(),
    description: z.string().optional(),
  })).default([]),
  educations: z.array(z.object({
    institution: z.string().min(1),
    degree:      z.string().min(1),
    field:       z.string().optional(),
    startDate:   z.string(),
    endDate:     z.string().optional(),
  })).default([]),
  skills: z.array(z.object({
    skillName: z.string().min(1),
    level:     z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  })).default([]),
  languages: z.array(z.object({
    language: z.string().min(1),
    level:    z.string().min(1),
  })).default([]),
})

// [หมายเหตุ] createResumeSchema เป็น z.object() ล้วนๆ ไม่มี .superRefine()/.refine()
// ผูกอยู่ จึง .partial() ได้ตรงๆ — ถ้าในอนาคตมีคนเพิ่ม validation แบบ cross-field
// ให้ทำตาม pattern เดียวกับ Jobs ด้านบน (แยก base schema ออกมาก่อน)
export const updateResumeSchema = createResumeSchema.partial()

// ── Apply ─────────────────────────────────────────────────────
export const applySchema = z.object({
  resumeId:    z.string().uuid().optional(),
  coverLetter: z.string().max(3000).optional(),
}).refine(d => d.resumeId, { message: 'Please select a resume', path: ['resumeId'] })

// ── Admin ─────────────────────────────────────────────────────
export const adminPatchUserSchema = z.object({
  isActive: z.boolean().optional(),
  role:     z.enum(['seeker', 'employer', 'admin']).optional(),
})

export const adminPatchJobSchema = z.object({
  status: z.enum(['draft', 'active', 'closed', 'expired']),
})

export const adminQuerySchema = z.object({
  q:      z.string().optional(),
  role:   z.enum(['seeker', 'employer', 'admin']).optional(),
  status: z.string().optional(),
  page:   z.coerce.number().positive().default(1),
  limit:  z.coerce.number().positive().max(100).default(20),
})

export const applicationStatusSchema = z.object({
  status:       z.enum(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']),
  employerNote: z.string().optional(),
})

// ── Account deletion ─────────────────────────────────────────
// z.literal() is exact-match and case-sensitive by default — satisfies
// "backend must independently verify DELETE/CONFIRM", not just trust the
// frontend's own two-step gating.
export const deleteAccountRequestSchema = z.object({
  confirmDelete: z.literal('DELETE'),
  confirmFinal:  z.literal('CONFIRM'),
})

export const recoverAccountSchema = z.object({
  recoveryToken: z.string().min(1),
})
