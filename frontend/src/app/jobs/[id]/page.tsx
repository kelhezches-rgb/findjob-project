'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Building2, Briefcase, Clock, CheckCircle2, Bookmark } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useSavedJobs } from '@/hooks'
import { SeekerNavbar } from '@/components/layout'
import { Button, LoadingSpinner } from '@/components/ui'
import { ApplyModal } from '@/components/jobs/ApplyModal'
import { ApplyChoiceModal } from '@/components/jobs/ApplyChoiceModal'
import { CompanyLogo } from '@/components/company/CompanyLogo'
import { CompanyQuickViewModal } from '@/components/company/CompanyQuickViewModal'
import { Job } from '@/types'

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'งานประจำ', part_time: 'พาร์ทไทม์', contract: 'สัญญาจ้าง',
  internship: 'ฝึกงาน', remote: 'ทำงานทางไกล',
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { savedIds, toggle } = useSavedJobs()
  const isSeeker = user?.role === 'seeker'

  const [job, setJob]           = useState<Job | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showChoiceModal, setShowChoiceModal] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [hasApplied, setHasApplied]   = useState(false)

  useEffect(() => {
    api.get<{ job: Job }>(`/jobs/${params.id}`)
      .then(r => { setJob(r.data.job); setHasApplied(Boolean(r.data.job.hasApplied)) })
      .catch(() => setError('ไม่พบประกาศงานนี้ หรือประกาศอาจถูกปิดรับสมัครแล้ว'))
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (job) document.title = `${job.title} - ${job.company.name} | JobBoard`
  }, [job])

  const jobPostingJsonLd = job ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt || job.createdAt,
    validThrough: job.expiresAt || undefined,
    employmentType: job.jobType.toUpperCase(),
    hiringOrganization: { '@type': 'Organization', name: job.company.name, logo: job.company.logoUrl || undefined },
    jobLocation: job.location ? {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location, addressRegion: job.province || undefined, addressCountry: 'TH' },
    } : undefined,
    baseSalary: (job.salaryMin || job.salaryMax) ? {
      '@type': 'MonetaryAmount',
      currency: 'THB',
      value: { '@type': 'QuantitativeValue', minValue: job.salaryMin || undefined, maxValue: job.salaryMax || undefined, unitText: 'MONTH' },
    } : undefined,
  } : null

  const handleApply = () => {
    if (!user) { router.push('/auth/login'); return }
    if (user.role !== 'seeker') return
    setShowChoiceModal(true)
  }

  const handleApplySuccess = () => { setIsModalOpen(false); setHasApplied(true) }

  const salary = job?.salaryMin && job?.salaryMax
    ? `฿${Number(job.salaryMin).toLocaleString()} – ฿${Number(job.salaryMax).toLocaleString()}`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
      <SeekerNavbar />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> กลับ
        </button>

        {loading && <LoadingSpinner />}
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {job && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setShowCompanyModal(true)} aria-label={`ดูข้อมูล ${job.company.name}`}>
                    <CompanyLogo name={job.company.name} logoUrl={job.company.logoUrl} size="lg" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                    <button type="button" onClick={() => setShowCompanyModal(true)}
                      className="text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600 hover:underline w-fit">
                      <Building2 className="h-3.5 w-3.5" />{job.company.name}
                    </button>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isSeeker && (
                    <button
                      type="button"
                      onClick={() => toggle(job.id)}
                      aria-label={savedIds.has(job.id) ? 'ยกเลิกบันทึกงาน' : 'บันทึกงาน'}
                      aria-pressed={savedIds.has(job.id)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                        savedIds.has(job.id)
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${savedIds.has(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  )}
                  {hasApplied
                    ? <Button variant="secondary" disabled><CheckCircle2 className="h-4 w-4" />สมัครแล้ว</Button>
                    : user?.role === 'seeker'
                      ? <Button onClick={handleApply}>สมัครงานนี้</Button>
                      : !user
                        ? <Button onClick={() => router.push('/auth/login')}>เข้าสู่ระบบเพื่อสมัคร</Button>
                        : null
                  }
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" />{JOB_TYPE_LABELS[job.jobType]}</span>
                {job.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{job.location}</span>}
                {salary && <span className="font-semibold text-gray-900">{salary}</span>}
                <span className="flex items-center gap-1.5 text-gray-400"><Clock className="h-4 w-4" />ลงประกาศ {new Date(job.createdAt).toLocaleDateString('th-TH')}</span>
              </div>

              {job.category && (
                <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{job.category.name}</span>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-base font-semibold text-gray-900">รายละเอียดงาน</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-3 text-base font-semibold text-gray-900">คุณสมบัติที่ต้องการ</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{job.requirements}</p>
              </div>
            )}

            {job.benefits && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-3 text-base font-semibold text-gray-900">สวัสดิการ</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{job.benefits}</p>
              </div>
            )}

            {job.company.description && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-gray-900">เกี่ยวกับ {job.company.name}</h2>
                  <Link href={`/companies/${job.company.id}`} className="shrink-0 text-sm text-indigo-600 hover:underline">
                    ดูโปรไฟล์บริษัท
                  </Link>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{job.company.description}</p>
              </div>
            )}

            <div className="flex justify-center">
              {!hasApplied && user?.role === 'seeker' && <Button onClick={handleApply}>สมัครงานนี้</Button>}
            </div>
          </div>
        )}

        {showChoiceModal && job && (
          <ApplyChoiceModal
            jobTitle={job.title}
            companyName={job.company.name}
            companyEmail={job.postedBy?.user?.email}
            applicantEmail={user?.email}
            applicant={user?.jobSeeker}
            onSelectResume={() => { setShowChoiceModal(false); setIsModalOpen(true) }}
            onClose={() => setShowChoiceModal(false)}
          />
        )}
        {isModalOpen && job && (
          <ApplyModal jobId={job.id} jobTitle={job.title} onClose={() => setIsModalOpen(false)} onSuccess={handleApplySuccess} />
        )}
        {showCompanyModal && job && (
          <CompanyQuickViewModal companyId={job.company.id} onClose={() => setShowCompanyModal(false)} />
        )}
      </main>
    </div>
  )
}
