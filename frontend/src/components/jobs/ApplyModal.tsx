'use client'
import { useEffect, useState } from 'react'
import { FileText, File as FileIcon, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { Resume } from '@/types'

interface ApplyModalProps {
  jobId: string
  jobTitle: string
  onClose: () => void
  onSuccess: () => void
}

export function ApplyModal({ jobId, jobTitle, onClose, onSuccess }: ApplyModalProps) {
  const { showToast } = useToast()
  const [resumes, setResumes]           = useState<Resume[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [coverLetter, setCoverLetter]   = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    api.get<{ resumes: Resume[] }>('/seeker/resumes')
      .then(r => {
        setResumes(r.data.resumes)
        const primary = r.data.resumes.find(x => x.isPrimary) || r.data.resumes[0]
        if (primary) setSelectedResumeId(primary.id)
      })
      .finally(() => setIsLoadingDocs(false))
  }, [])

  const handleSubmit = async () => {
    setError(null)
    if (!selectedResumeId) { setError('กรุณาเลือก Resume'); return }
    setIsSubmitting(true)
    try {
      await api.post(`/jobs/${jobId}/apply`, { resumeId: selectedResumeId, coverLetter: coverLetter || undefined })
      showToast(`สมัครงาน "${jobTitle}" สำเร็จแล้ว`, 'success')
      onSuccess()
    } catch (e: any) {
      const message = e?.response?.data?.message || 'สมัครงานไม่สำเร็จ'
      setError(message)
      showToast(message, 'error')
    } finally { setIsSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">สมัครงาน</h2>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="ปิด">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {isLoadingDocs ? (
            <p className="py-8 text-center text-sm text-gray-400">กำลังโหลด...</p>
          ) : resumes.length === 0 ? (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
              คุณยังไม่มี Resume — กรุณาสร้าง Resume ก่อนสมัครงาน
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">เลือก Resume</p>
                <div className="flex flex-col gap-2">
                  {resumes.map(resume => (
                    <label key={resume.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors
                        ${selectedResumeId === resume.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {resume.title}
                        {resume.isPrimary && <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">หลัก</span>}
                      </span>
                      <input type="radio" name="resume" checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)} className="h-4 w-4" />
                    </label>
                  ))}
                </div>
              </div>

              <Textarea label="จดหมายสมัครงาน (ไม่บังคับ)" rows={4}
                placeholder="บอกเหตุผลว่าทำไมคุณถึงเหมาะกับตำแหน่งนี้"
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} maxLength={2000} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>ยกเลิก</Button>
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting} disabled={resumes.length === 0}>
            <CheckCircle2 className="h-4 w-4" /> ยืนยันสมัครงาน
          </Button>
        </div>
      </div>
    </div>
  )
}
