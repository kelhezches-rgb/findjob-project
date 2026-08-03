'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Mail, Phone, Briefcase, GraduationCap, Sparkles, Languages as LanguagesIcon,
  Download, Loader2, FileX, ShieldAlert,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Badge, LoadingSpinner, EmptyState } from '@/components/ui'
import { ApplicantDetail } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอพิจารณา', reviewed: 'พิจารณาแล้ว', shortlisted: 'ผ่านคัดเลือก', rejected: 'ไม่ผ่าน', hired: 'รับเข้าทำงาน',
}

const NOT_SPECIFIED = 'ไม่ระบุ'

export default function ApplicantDetailPage() {
  const params = useParams<{ id: string; applicationId: string }>()
  const router = useRouter()
  const { showToast } = useToast()

  const [detail, setDetail] = useState<ApplicantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [openingCv, setOpeningCv] = useState(false)

  useEffect(() => {
    let active = true
    api.get<{ application: ApplicantDetail }>(`/employer/applications/${params.applicationId}`)
      .then(r => { if (active) setDetail(r.data.application) })
      .catch(e => { if (active) setErrorStatus(e?.response?.status || 500) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [params.applicationId])

  const handleOpenCv = async () => {
    setOpeningCv(true)
    try {
      const res = await api.get(`/employer/applications/${params.applicationId}/cv-file`, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(res.data)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (e: any) {
      showToast(e?.response?.status === 404 ? 'ไม่พบไฟล์ CV นี้ในระบบ' : 'ไม่สามารถเปิดไฟล์ CV ได้', 'error')
    } finally {
      setOpeningCv(false)
    }
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> กลับไปหน้าผู้สมัคร
      </button>

      {loading && <LoadingSpinner />}

      {!loading && errorStatus === 403 && (
        <EmptyState icon={<ShieldAlert className="h-12 w-12" />} title="คุณไม่มีสิทธิ์เข้าถึงใบสมัครนี้"
          description="ใบสมัครนี้ไม่ได้เป็นของตำแหน่งงานในบริษัทของคุณ" />
      )}
      {!loading && errorStatus === 404 && (
        <EmptyState icon={<FileX className="h-12 w-12" />} title="ไม่พบใบสมัครนี้" description="ใบสมัครอาจถูกลบหรือไม่มีอยู่จริง" />
      )}
      {!loading && errorStatus && errorStatus !== 403 && errorStatus !== 404 && (
        <EmptyState icon={<ShieldAlert className="h-12 w-12" />} title="เกิดข้อผิดพลาด" description="ไม่สามารถโหลดข้อมูลผู้สมัครได้ กรุณาลองใหม่" />
      )}

      {!loading && detail && (
        <div className="flex flex-col gap-4">
          {/* Header card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {detail.jobSeeker.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={detail.jobSeeker.avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                    {detail.jobSeeker.firstName?.[0] || '?'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {detail.jobSeeker.firstName} {detail.jobSeeker.lastName}
                  </h1>
                  <p className="text-sm text-gray-500">{detail.jobSeeker.headline || NOT_SPECIFIED}</p>
                  <p className="mt-0.5 text-xs text-gray-400">สมัครตำแหน่ง {detail.job.title}</p>
                </div>
              </div>
              <Badge label={STATUS_LABELS[detail.status] || detail.status} variant={detail.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-gray-400" />{detail.jobSeeker.user.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-gray-400" />{detail.jobSeeker.phone || NOT_SPECIFIED}</span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              สมัครเมื่อ {new Date(detail.appliedAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}
              {detail.reviewedAt && <> · พิจารณาเมื่อ {new Date(detail.reviewedAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}</>}
            </p>
          </div>

          {detail.jobSeeker.bio && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">เกี่ยวกับผู้สมัคร</h2>
              <p className="text-sm leading-relaxed text-gray-600">{detail.jobSeeker.bio}</p>
            </div>
          )}

          {detail.coverLetter && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">จดหมายสมัครงาน</h2>
              <p className="text-sm leading-relaxed text-gray-600">{detail.coverLetter}</p>
            </div>
          )}

          {/* Resume */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Resume</h2>
              {detail.resume?.cvFileUrl && (
                <button
                  type="button"
                  onClick={handleOpenCv}
                  disabled={openingCv}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60"
                >
                  {openingCv ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {detail.resume.cvFileName || 'เปิดไฟล์ CV'}
                </button>
              )}
            </div>

            {!detail.resume ? (
              <p className="flex items-center gap-1.5 text-sm text-gray-400"><FileX className="h-4 w-4" /> ไม่มี Resume แนบมากับใบสมัครนี้</p>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-medium text-gray-900">{detail.resume.title}</p>
                  {detail.resume.summary && <p className="mt-1 text-sm text-gray-600">{detail.resume.summary}</p>}
                  {detail.resume.expectedSalary && (
                    <p className="mt-1 text-sm text-gray-500">เงินเดือนที่คาดหวัง: ฿{Number(detail.resume.expectedSalary).toLocaleString('th-TH')}</p>
                  )}
                </div>

                {detail.resume.experiences.length > 0 && (
                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Briefcase className="h-4 w-4" /> ประสบการณ์ทำงาน</h3>
                    <div className="flex flex-col gap-3">
                      {detail.resume.experiences.map((exp, i) => (
                        <div key={i} className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
                          <p className="font-medium text-gray-900">{exp.position} · {exp.company}</p>
                          <p className="text-xs text-gray-400">{exp.startDate} – {exp.endDate || 'ปัจจุบัน'}</p>
                          {exp.description && <p className="mt-1 text-gray-600">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {detail.resume.educations.length > 0 && (
                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><GraduationCap className="h-4 w-4" /> การศึกษา</h3>
                    <div className="flex flex-col gap-3">
                      {detail.resume.educations.map((edu, i) => (
                        <div key={i} className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
                          <p className="font-medium text-gray-900">{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-xs text-gray-400">{edu.startDate} – {edu.endDate || 'ปัจจุบัน'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {detail.resume.skills.length > 0 && (
                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Sparkles className="h-4 w-4" /> ทักษะ</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.resume.skills.map((s, i) => (
                        <span key={i} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{s.skillName} · {s.level}</span>
                      ))}
                    </div>
                  </section>
                )}

                {detail.resume.languages.length > 0 && (
                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><LanguagesIcon className="h-4 w-4" /> ภาษา</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.resume.languages.map((l, i) => (
                        <span key={i} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{l.language} · {l.level}</span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
