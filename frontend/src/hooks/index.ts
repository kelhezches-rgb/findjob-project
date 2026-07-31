'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Job, Resume, Application, SavedJob, Category, Applicant, Pagination, AdminStats } from '@/types'

export interface JobFilters {
  q?: string; province?: string; district?: string; subDistrict?: string; jobType?: string
  categoryId?: string; isRemote?: boolean; page?: number
  sort?: 'latest' | 'oldest' | 'salary_desc' | 'salary_asc'
}
export function useJobSearch(filters: JobFilters = {}) {
  const [jobs, setJobs]             = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, page: filters.page || 1, limit: 10 })
          .filter(([, v]) => v !== undefined && v !== '')
      )
      const { data } = await api.get('/jobs', { params })
      setJobs(data.jobs); setPagination(data.pagination)
    } catch { setError('โหลดงานไม่สำเร็จ') }
    finally { setIsLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])
  return { jobs, pagination, isLoading, error, refetch: fetch }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  useEffect(() => {
    api.get<{ categories: Category[] }>('/jobs/categories')
      .then(r => setCategories(r.data.categories))
      .finally(() => setIsLoading(false))
  }, [])
  return { categories, isLoading }
}

export function useResumes() {
  const [resumes, setResumes]     = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await api.get<{ resumes: Resume[] }>('/seeker/resumes'); setResumes(data.resumes) }
    finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])

  const deleteResume = useCallback(async (id: string) => {
    await api.delete(`/seeker/resumes/${id}`)
    setResumes(prev => prev.filter(r => r.id !== id))
  }, [])

  return { resumes, isLoading, refetch: fetch, deleteResume }
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    api.get<{ applications: Application[] }>('/seeker/applications')
      .then(r => setApplications(r.data.applications))
      .catch(() => setError('โหลดประวัติการสมัครงานไม่สำเร็จ'))
      .finally(() => setIsLoading(false))
  }, [])

  return { applications, isLoading, error }
}

export function useSavedJobs() {
  const { user, accessToken } = useAuthStore()
  const canFetch = Boolean(accessToken && user?.role === 'seeker')

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [savedIds, setSavedIds]   = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(canFetch)

  const fetch = useCallback(async () => {
    if (!canFetch) { setSavedJobs([]); setSavedIds(new Set()); setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await api.get<{ savedJobs: SavedJob[] }>('/seeker/saved-jobs')
      setSavedJobs(data.savedJobs)
      setSavedIds(new Set(data.savedJobs.map(s => s.job.id)))
    } finally { setIsLoading(false) }
  }, [canFetch])
  useEffect(() => { fetch() }, [fetch])

  const toggle = useCallback(async (jobId: string) => {
    if (!canFetch) return
    if (savedIds.has(jobId)) {
      await api.delete(`/seeker/saved-jobs/${jobId}`)
      setSavedIds(p => { const n = new Set(p); n.delete(jobId); return n })
      setSavedJobs(p => p.filter(s => s.job.id !== jobId))
    } else {
      await api.post(`/seeker/saved-jobs/${jobId}`)
      setSavedIds(p => new Set([...p, jobId]))
      await fetch()
    }
  }, [savedIds, fetch, canFetch])

  return { savedJobs, savedIds, isLoading, toggle, refetch: fetch }
}

export function useEmployerJobs() {
  const [jobs, setJobs]             = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading]   = useState(true)

  const fetch = useCallback(async (params?: { status?: string; page?: number }) => {
    setIsLoading(true)
    try {
      const { data } = await api.get('/employer/jobs', { params: { page: 1, limit: 20, ...params } })
      setJobs(data.jobs); setPagination(data.pagination)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])

  const deleteJob = useCallback(async (id: string) => {
    await api.delete(`/employer/jobs/${id}`)
    setJobs(prev => prev.filter(j => j.id !== id))
  }, [])

  const setStatus = useCallback(async (id: string, status: string) => {
    const { data } = await api.patch<{ job: Job }>(`/employer/jobs/${id}/status`, { status })
    setJobs(prev => prev.map(j => j.id === id ? data.job : j))
  }, [])

  return { jobs, pagination, isLoading, refetch: fetch, deleteJob, setStatus }
}

export function useApplicants(jobId: string) {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading]   = useState(true)

  const fetch = useCallback(async (params?: { status?: string; page?: number }) => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/employer/jobs/${jobId}/applicants`, { params: { page: 1, limit: 20, ...params } })
      setApplicants(data.applications); setPagination(data.pagination)
    } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { fetch() }, [fetch])

  const updateStatus = useCallback(async (appId: string, status: string, note?: string) => {
    const { data } = await api.patch<{ application: Applicant }>(`/employer/applications/${appId}/status`, {
      status, employerNote: note,
    })
    setApplicants(prev => prev.map(a => a.id === appId ? data.application : a))
  }, [])

  return { applicants, pagination, isLoading, refetch: fetch, updateStatus }
}

export function useAdminStats() {
  const [stats, setStats]         = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    api.get<{ stats: AdminStats }>('/admin/stats')
      .then(r => setStats(r.data.stats))
      .finally(() => setIsLoading(false))
  }, [])
  return { stats, isLoading }
}
