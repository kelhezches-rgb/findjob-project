'use client'
import Link from 'next/link'
import { Bookmark, Trash2 } from 'lucide-react'
import { useSavedJobs } from '@/hooks'
import { EmptyState, LoadingSpinner, Button } from '@/components/ui'

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'งานประจำ', part_time: 'พาร์ทไทม์', contract: 'สัญญาจ้าง', internship: 'ฝึกงาน', remote: 'ทำงานทางไกล',
}

export default function SavedJobsPage() {
  const { savedJobs, isLoading, toggle } = useSavedJobs()

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">งานที่บันทึกไว้</h1>

      {isLoading && <LoadingSpinner />}

      {!isLoading && savedJobs.length === 0 && (
        <EmptyState icon={<Bookmark className="h-12 w-12" />}
          title="ยังไม่มีงานที่บันทึกไว้" description="กดไอคอน bookmark ที่หน้าค้นหางานเพื่อบันทึก"
          action={<Link href="/jobs"><Button variant="secondary">ค้นหางาน</Button></Link>} />
      )}

      <div className="flex flex-col gap-3">
        {savedJobs.map(saved => (
          <div key={saved.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-lg font-bold text-indigo-600">
              {saved.job.company.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${saved.job.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                {saved.job.title}
              </Link>
              <p className="text-sm text-gray-500">{saved.job.company.name}</p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 font-medium">
                  {JOB_TYPE_LABELS[saved.job.jobType] || saved.job.jobType}
                </span>
                <span>บันทึกเมื่อ {new Date(saved.savedAt).toLocaleDateString('th-TH')}</span>
              </div>
            </div>
            <button onClick={() => toggle(saved.job.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
