export type UserRole = 'seeker' | 'employer' | 'admin'
export type JobType  = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'
export type JobStatus   = 'draft' | 'active' | 'closed' | 'expired'
export type ApplyStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface User {
  id: string; email: string; role: UserRole
  isActive: boolean; isVerified: boolean; createdAt: string
  jobSeeker?: JobSeekerProfile | null
  employer?:  EmployerProfile  | null
}
export interface JobSeekerProfile {
  id: string; firstName: string; lastName: string
  phone?: string | null; avatarUrl?: string | null
  headline?: string | null; bio?: string | null
}
export interface EmployerProfile {
  id: string; position?: string | null
  company: Company
}
export interface Company {
  id: string; name: string; logoUrl?: string | null
  coverImageUrl?: string | null
  website?: string | null; industry?: string | null
  size?: string | null; description?: string | null
  address?: string | null; province?: string | null
  isVerified: boolean; createdAt?: string
}
export interface Category { id: string; name: string; slug: string; icon?: string | null; group?: string | null }

export interface Job {
  id: string; title: string; description: string
  requirements?: string | null; benefits?: string | null
  location?: string | null; province?: string | null
  isRemote: boolean; jobType: JobType; status: JobStatus
  experienceLevel?: ExperienceLevel | null
  salaryMin?: number | string | null; salaryMax?: number | string | null
  tags: string[]; viewsCount: number
  publishedAt?: string | null; expiresAt?: string | null
  createdAt: string; updatedAt: string
  company: Pick<Company, 'id' | 'name' | 'logoUrl' | 'industry'> & { description?: string | null; website?: string | null }
  postedBy?: { position?: string | null; user: { email: string } }
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null
  categoryId?: string | null
  hasApplied?: boolean
  _count?: { applications: number }
}

export interface Resume {
  id: string; title: string; summary?: string | null
  isPrimary: boolean; experiences: ResumeExperience[]
  educations: ResumeEducation[]; skills: ResumeSkill[]
  languages: ResumeLanguage[]; cvFileUrl?: string | null
  cvFileName?: string | null; cvFileSize?: number | null
  expectedSalary?: number | null; createdAt: string; updatedAt: string
}
export interface ResumeExperience {
  company: string; position: string; startDate: string
  endDate?: string; description?: string
}
export interface ResumeEducation {
  institution: string; degree: string; field?: string
  startDate: string; endDate?: string
}
export interface ResumeSkill { skillName: string; level: SkillLevel }
export interface ResumeLanguage { language: string; level: string }

export interface Application {
  id: string; status: ApplyStatus; coverLetter?: string | null
  appliedAt: string; updatedAt: string
  job: Pick<Job, 'id' | 'title' | 'jobType' | 'status'> & {
    company: Pick<Company, 'name' | 'logoUrl'>
    category?: Pick<Category, 'name'> | null
  }
  resume?: Pick<Resume, 'id' | 'title'> | null
}

export interface Applicant {
  id: string; status: ApplyStatus; coverLetter?: string | null
  employerNote?: string | null; appliedAt: string
  jobSeeker: Pick<JobSeekerProfile, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'headline'>
  resume?: (Pick<Resume, 'id' | 'title'> & { cvFileUrl?: string | null; cvFileName?: string | null }) | null
}

export interface SavedJob {
  id: string; savedAt: string
  job: Pick<Job, 'id' | 'title' | 'jobType' | 'status'> & {
    company: Pick<Company, 'name' | 'logoUrl'>
    category?: Pick<Category, 'name'> | null
  }
}

export interface Pagination {
  total: number; page: number; limit: number
  totalPages: number; hasNext: boolean; hasPrev: boolean
}

export interface ApiError {
  message: string
  errors?: { field: string; message: string }[]
}

export interface AdminStats {
  totalUsers: number; totalJobs: number; totalCompanies: number
  totalApplications: number; activeJobs: number; newUsersThisMonth: number
  jobsByStatus: Record<string, number>
  appsByStatus: Record<string, number>
}
