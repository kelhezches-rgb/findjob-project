'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Phone, Mail, FileText, Download, Loader2, FileX, Inbox } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Badge, LoadingSpinner, EmptyState, PaginationBar, JobCardSkeleton } from '@/components/ui'
import { ApplicantResumeModal } from '@/components/employer/ApplicantResumeModal'
import { useEmployerJobs } from '@/hooks'
import { ApplicationListItem, Pagination } from '@/types'

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']
const STATUS_LABELS: Record<string, string> = {
  pending: 'รอตรวจสอบ', reviewed: 'ตรวจสอบแล้ว', shortlisted: 'ผ่านการคัดเลือก', rejected: 'ไม่ผ่าน', hired: 'รับเข้าทำงาน',
}

type SortOption = 'latest' | 'oldest'

export default function EmployerApplicationsPage() {
  const { showToast } = useToast()
  const { jobs: allJobs } = useEmployerJobs()

  const [applications, setApplications] = useState<ApplicationListItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [jobId, setJobId] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<SortOption>('latest')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [resumeModalAppId, setResumeModalAppId] = useState<string | null>(null)
  const [openingCvFor, setOpeningCvFor] = useState<string | null>(null)
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const { data } = await api.get('/employer/applications', {
        params: { page, limit: 20, sort, status: status || undefined, jobId: jobId || undefined },
      })
      setApplications(data.applications)
      setPagination(data.pagination)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [page, sort, status, jobId])

  useEffect(() => { load() }, [load])

  // Simple client-side search over the current page's results — per spec,
  // keep it lightweight rather than adding a server-side search endpoint.
  const visibleApplications = search.trim()
    ? applications.filter(app => {
        const q = search.trim().toLowerCase()
        const name = `${app.jobSeeker.firstName} ${app.jobSeeker.lastName}`.toLowerCase()
        return name.includes(q) || app.jobSeeker.user.email.toLowerCase().includes(q) || app.job.title.toLowerCase().includes(q)
      })
    : applications

  const handleStatusChange = async (app: ApplicationListItem, newStatus: string) => {
    setUpdatingStatusFor(app.id)
    try {
      await api.patch(`/employer/applications/${app.id}/status`, { status: newStatus })
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus as ApplicationListItem['status'] } : a))
    } catch {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error')
    } finally {
      setUpdatingStatusFor(null)
    }
  }

  // Same authorized-blob pattern as the per-job applicants page — never a
  // raw /uploads URL, always through the authenticated endpoint.
  const handleOpenCv = async (applicationId: string) => {
    setOpeningCvFor(applicationId)
    try {
      const res = await api.get(`/employer/applications/${applicationId}/cv-file`, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(res.data)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (e: any) {
      const message = e?.response?.status === 404
        ? 'ไม่พบไฟล์ CV นี้ในระบบ'
        : e?.response?.status === 403
          ? 'คุณไม่มีสิทธิ์เข้าถึงไฟล์นี้'
          : 'ไม่สามารถเปิดไฟล์ CV ได้'
      showToast(message, 'error')
    } finally {
      setOpeningCvFor(null)
    }
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">ใบสมัครงาน</h1>
        <p className="text-sm text-gray-500">จัดการผู้สมัครจากทุกประกาศงานของบริษัท</p>
        {pagination && <p className="mt-1 text-xs text-gray-400">ผู้สมัครทั้งหมด {pagination.total} คน</p>}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ อีเมล หรือตำแหน่งงาน"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <select value={jobId} onChange={e => { setJobId(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="">ทุกตำแหน่งงาน</option>
          {allJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>

        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="">ทุกสถานะ</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>

        <select value={sort} onChange={e => { setSort(e.target.value as SortOption); setPage(1) }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="latest">สมัครล่าสุด</option>
          <option value="oldest">สมัครเก่าสุด</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && loadError && (
        <EmptyState icon={<Inbox className="h-12 w-12" />} title="โหลดข้อมูลไม่สำเร็จ"
          description="เกิดข้อผิดพลาดในการโหลดผู้สมัคร"
          action={<button onClick={load} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">ลองใหม่</button>} />
      )}

      {!isLoading && !loadError && applications.length === 0 && (
        <EmptyState icon={<Inbox className="h-12 w-12" />} title="ยังไม่มีผู้สมัครงาน" description="เมื่อมีผู้สมัครเข้ามา รายการจะแสดงที่นี่" />
      )}

      {!isLoading && !loadError && applications.length > 0 && visibleApplications.length === 0 && (
        <EmptyState icon={<Search className="h-12 w-12" />} title="ไม่พบผู้สมัครที่ตรงกับคำค้นหา" />
      )}

      {!isLoading && !loadError && visibleApplications.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleApplications.map(app => (
            <div key={app.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {app.jobSeeker.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.jobSeeker.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                      {app.jobSeeker.firstName?.[0] || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link href={`/employer/jobs/${app.job.id}/applicants/${app.id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline">
                      {app.jobSeeker.firstName} {app.jobSeeker.lastName}
                    </Link>
                    <p className="truncate text-sm text-gray-500">สมัครตำแหน่ง {app.job.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.jobSeeker.user.email}</span>
                      {app.jobSeeker.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.jobSeeker.phone}</span>}
                      <span>สมัครเมื่อ {new Date(app.appliedAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge label={STATUS_LABELS[app.status] || app.status} variant={app.status} />
                  <select
                    value={app.status}
                    disabled={updatingStatusFor === app.id}
                    onChange={e => handleStatusChange(app, e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-500 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={`/employer/jobs/${app.job.id}/applicants/${app.id}`}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
                  ดูรายละเอียดผู้สมัคร
                </Link>

                {app.resume ? (
                  <button type="button" onClick={() => setResumeModalAppId(app.id)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
                    <FileText className="h-3.5 w-3.5" /> ดู Resume
                  </button>
                ) : (
                  <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400">
                    <FileX className="h-3.5 w-3.5" /> ไม่มี Resume
                  </span>
                )}

                {app.resume?.cvFileUrl && (
                  <button type="button" onClick={() => handleOpenCv(app.id)} disabled={openingCvFor === app.id}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60">
                    {openingCvFor === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    {app.resume.cvFileName || 'เปิดไฟล์ CV'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <PaginationBar pagination={pagination} onPageChange={setPage} />
      )}

      {resumeModalAppId && (
        <ApplicantResumeModal applicationId={resumeModalAppId} onClose={() => setResumeModalAppId(null)} />
      )}
    </main>
  )
}
