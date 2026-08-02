'use client'
import { useEffect, useState } from 'react'
import { X, Briefcase, GraduationCap, Sparkles, Languages as LanguagesIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui'
import { Resume } from '@/types'

interface ApplicantResumeModalProps {
  applicationId: string
  onClose: () => void
}

export function ApplicantResumeModal({ applicationId, onClose }: ApplicantResumeModalProps) {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api.get<{ resume: Resume }>(`/employer/applications/${applicationId}/resume`)
      .then(r => { if (active) setResume(r.data.resume) })
      .catch(e => { if (active) setError(e?.response?.data?.message || 'ไม่สามารถโหลด Resume ได้') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [applicationId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิด"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {loading && <div className="py-8"><LoadingSpinner /></div>}
        {error && <p className="py-8 text-center text-sm text-red-600">{error}</p>}

        {resume && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{resume.title}</h2>
              {resume.summary && <p className="mt-2 text-sm leading-relaxed text-gray-600">{resume.summary}</p>}
              {resume.expectedSalary && (
                <p className="mt-1 text-sm text-gray-500">เงินเดือนที่คาดหวัง: ฿{Number(resume.expectedSalary).toLocaleString('th-TH')}</p>
              )}
            </div>

            {resume.experiences.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Briefcase className="h-4 w-4" /> ประสบการณ์ทำงาน
                </h3>
                <div className="flex flex-col gap-3">
                  {resume.experiences.map((exp, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
                      <p className="font-medium text-gray-900">{exp.position} · {exp.company}</p>
                      <p className="text-xs text-gray-400">{exp.startDate} – {exp.endDate || 'ปัจจุบัน'}</p>
                      {exp.description && <p className="mt-1 text-gray-600">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {resume.educations.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <GraduationCap className="h-4 w-4" /> การศึกษา
                </h3>
                <div className="flex flex-col gap-3">
                  {resume.educations.map((edu, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 px-3.5 py-2.5 text-sm">
                      <p className="font-medium text-gray-900">{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-400">{edu.startDate} – {edu.endDate || 'ปัจจุบัน'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {resume.skills.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <Sparkles className="h-4 w-4" /> ทักษะ
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.map((s, i) => (
                    <span key={i} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {s.skillName} · {s.level}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {resume.languages.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  <LanguagesIcon className="h-4 w-4" /> ภาษา
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.languages.map((l, i) => (
                    <span key={i} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                      {l.language} · {l.level}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
