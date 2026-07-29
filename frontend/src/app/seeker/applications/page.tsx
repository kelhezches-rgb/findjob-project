'use client'
import Link from 'next/link'
import { Search, FileText } from 'lucide-react'
import { useApplications } from '@/hooks'
import { Badge, EmptyState, LoadingSpinner, Button } from '@/components/ui'

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอพิจารณา', reviewed: 'พิจารณาแล้ว', shortlisted: 'ผ่านคัดเลือก', rejected: 'ไม่ผ่าน', hired: 'รับเข้าทำงาน',
}

export default function ApplicationsPage() {
  const { applications, isLoading, error } = useApplications()

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">งานที่สมัคร</h1>

      {error     && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
      {isLoading && <LoadingSpinner />}

      {!isLoading && applications.length === 0 && (
        <EmptyState icon={<Search className="h-12 w-12" />}
          title="ยังไม่มีประวัติการสมัครงาน" description="เริ่มสมัครงานที่คุณสนใจได้เลย"
          action={<Link href="/jobs"><Button variant="secondary">ค้นหางาน</Button></Link>} />
      )}

      <div className="flex flex-col gap-3">
        {applications.map(app => (
          <div key={app.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/jobs/${app.job.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                  {app.job.title}
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">{app.job.company.name}</p>
              </div>
              <Badge label={STATUS_LABELS[app.status] || app.status} variant={app.status} />
            </div>

            {app.resume && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <FileText className="h-3.5 w-3.5" /><span>{app.resume.title}</span>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-400">
              สมัครเมื่อ {new Date(app.appliedAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
