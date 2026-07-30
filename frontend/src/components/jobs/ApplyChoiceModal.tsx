'use client'
import { useEffect, useState } from 'react'
import { FileText, Mail, X } from 'lucide-react'
import { api, API_ORIGIN } from '@/lib/api'
import { Resume, JobSeekerProfile } from '@/types'

interface ApplyChoiceModalProps {
  jobTitle: string
  companyName: string
  companyEmail?: string | null
  applicantEmail?: string
  applicant?: JobSeekerProfile | null
  onSelectResume: () => void
  onClose: () => void
}

export function ApplyChoiceModal({
  jobTitle, companyName, companyEmail, applicantEmail, applicant, onSelectResume, onClose,
}: ApplyChoiceModalProps) {
  const [resumeLink, setResumeLink] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ resumes: Resume[] }>('/seeker/resumes')
      .then(r => {
        const primary = r.data.resumes.find(x => x.isPrimary) || r.data.resumes[0]
        if (primary?.cvFileUrl) setResumeLink(`${API_ORIGIN}${primary.cvFileUrl}`)
      })
      .catch(() => {})
  }, [])

  const handleEmailApply = () => {
    if (!companyEmail) return

    const applicantName = applicant ? `${applicant.firstName} ${applicant.lastName}` : ''
    const subject = `Application for ${jobTitle}`
    const bodyLines = [
      `Hello,`,
      ``,
      `I am writing to apply for the position of ${jobTitle} at ${companyName}.`,
      ``,
      `Name: ${applicantName}`,
      `Email: ${applicantEmail || '-'}`,
      `Phone: ${applicant?.phone || '-'}`,
      ...(resumeLink ? [`Resume: ${resumeLink}`] : []),
      ``,
      `Thank you for your consideration.`,
      ``,
      applicantName,
    ]
    const body = bodyLines.join('\n')

    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    const mailtoUrl = `mailto:${companyEmail}?subject=${encodedSubject}&body=${encodedBody}`
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(companyEmail)}&su=${encodedSubject}&body=${encodedBody}`

    // Open Gmail from this user-initiated click. Do not use `noopener` as a
    // window feature: browsers intentionally return `null` for that option,
    // which made the old code also trigger the mailto fallback even after
    // Gmail had opened. That could take the applicant away from the site or
    // make the application appear to fail.
    let gmailWindow: Window | null = null
    try {
      gmailWindow = window.open(gmailUrl, '_blank')
      if (gmailWindow) gmailWindow.opener = null
    } catch { gmailWindow = null }

    if (!gmailWindow) {
      window.location.href = mailtoUrl
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
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

        <h2 className="text-base font-semibold text-gray-900">สมัครงานนี้ด้วยวิธีไหน?</h2>
        <p className="mt-1 text-sm text-gray-500">{jobTitle}</p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onSelectResume}
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-gray-900">สมัครด้วย Resume</span>
              <span className="block text-xs text-gray-500">เลือก Resume ที่คุณสร้างไว้ในระบบ</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleEmailApply}
            disabled={!companyEmail}
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-transparent"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Mail className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-gray-900">สมัครทางอีเมลบริษัท</span>
              <span className="block text-xs text-gray-500">
                {companyEmail ? 'เปิดแอปอีเมลของคุณเพื่อส่งใบสมัคร' : 'บริษัทนี้ยังไม่เปิดให้สมัครทางอีเมล'}
              </span>
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  )
}
