'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui'
import JobPostForm from '@/components/employer/JobPostForm'
import { Job } from '@/types'

export default function EditJobPage() {
  const params = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ job: Job }>(`/employer/jobs/${params.id}`)
      .then(r => setJob(r.data.job))
      .catch(() => setError('ไม่พบประกาศงานนี้'))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">แก้ไขประกาศงาน</h1>
        <p className="text-sm text-gray-500">ปรับปรุงข้อมูลให้เป็นปัจจุบัน</p>
      </div>
      {loading && <LoadingSpinner />}
      {error   && <p className="text-sm text-red-600">{error}</p>}
      {job     && <JobPostForm initialJob={job} />}
    </main>
  )
}
