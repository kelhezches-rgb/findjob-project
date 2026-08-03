'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FileText, Download, Phone, Loader2, FileX } from 'lucide-react'
import { useApplicants } from '@/hooks'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { ApplicantResumeModal } from '@/components/employer/ApplicantResumeModal'
import { Applicant } from '@/types'

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']
const STATUS_LABELS: Record<string, string> = {
  pending: 'รอพิจารณา', reviewed: 'พิจารณาแล้ว', shortlisted: 'ผ่านคัดเลือก', rejected: 'ไม่ผ่าน', hired: 'รับเข้าทำงาน',
}

export default function ApplicantsPage() {
  const params = useParams<{ id: string }>()
  const { applicants, isLoading, refetch, updateStatus } = useApplicants(params.id)
  const { showToast } = useToast()
  const [resumeModalAppId, setResumeModalAppId] = useState<string | null>(null)
  const [openingCvFor, setOpeningCvFor] = useState<string | null>(null)

  const handleStatusChange = async (app: Applicant, newStatus: string) => { await updateStatus(app.id, newStatus) }

  // Fetches the CV through the authorized endpoint (not a public /uploads
  // URL) with the normal Authorization header, then opens the blob in a
  // new tab — a plain <a href> new-tab navigation can't send auth headers.
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
        <h1 className="text-xl font-bold text-gray-900">ผู้สมัคร</h1>
        <p className="text-sm text-gray-500">{applicants.length} ใบสมัคร</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => refetch()} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white">ทั้งหมด</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => refetch({ status: s })}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-indigo-300">
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && applicants.length === 0 && (
        <EmptyState icon={<div className="text-5xl">📭</div>} title="ยังไม่มีผู้สมัคร" description="ประกาศงานของคุณยังไม่มีผู้สมัคร" />
      )}

      <div className="flex flex-col gap-3">
        {applicants.map(app => (
          <div key={app.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/employer/jobs/${params.id}/applicants/${app.id}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline">
                  {app.jobSeeker.firstName} {app.jobSeeker.lastName}
                </Link>
                {app.jobSeeker.headline && <p className="text-sm text-gray-500">{app.jobSeeker.headline}</p>}
                {app.jobSeeker.phone && (
                  <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Phone className="h-3 w-3" />{app.jobSeeker.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge label={STATUS_LABELS[app.status] || app.status} variant={app.status} />
                <select value={app.status} onChange={e => handleStatusChange(app, e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-500">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>

            {app.coverLetter && (
              <p className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 line-clamp-3">{app.coverLetter}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {app.resume ? (
                <button
                  type="button"
                  onClick={() => setResumeModalAppId(app.id)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <FileText className="h-3.5 w-3.5" /> ดู Resume
                </button>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400">
                  <FileX className="h-3.5 w-3.5" /> ไม่มี Resume
                </span>
              )}
              {app.resume?.cvFileUrl && (
                <button
                  type="button"
                  onClick={() => handleOpenCv(app.id)}
                  disabled={openingCvFor === app.id}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60"
                >
                  {openingCvFor === app.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Download className="h-3.5 w-3.5" />}
                  {app.resume.cvFileName || 'เปิดไฟล์ CV'}
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              สมัครเมื่อ {new Date(app.appliedAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </p>
          </div>
        ))}
      </div>

      {resumeModalAppId && (
        <ApplicantResumeModal applicationId={resumeModalAppId} onClose={() => setResumeModalAppId(null)} />
      )}
    </main>
  )
}
