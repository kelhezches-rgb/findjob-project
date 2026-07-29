'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui'
import ResumeForm from '@/components/resume/ResumeForm'
import { Resume } from '@/types'

export default function EditResumePage() {
  const params = useParams<{ id: string }>()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ resume: Resume }>(`/seeker/resumes/${params.id}`)
      .then(r => setResume(r.data.resume))
      .catch(() => setError('ไม่พบ Resume นี้'))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">แก้ไข Resume</h1>
        <p className="text-sm text-gray-500">ปรับปรุงข้อมูลให้เป็นปัจจุบัน</p>
      </div>
      {loading && <LoadingSpinner />}
      {error   && <p className="text-sm text-red-600">{error}</p>}
      {resume  && <ResumeForm initialResume={resume} />}
    </main>
  )
}
