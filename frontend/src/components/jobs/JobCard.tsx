'use client'
import { memo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Building2, Clock, Bookmark } from 'lucide-react'
import { Job, JobType } from '@/types'
import { CompanyLogo } from '@/components/company/CompanyLogo'
import { CompanyQuickViewModal } from '@/components/company/CompanyQuickViewModal'
import { formatSalary } from '@/lib/salary'

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'งานประจำ', part_time: 'พาร์ทไทม์', contract: 'สัญญาจ้าง',
  internship: 'ฝึกงาน', remote: 'ทำงานทางไกล',
}

interface JobCardProps {
  job: Job
  isSaved?: boolean
  onToggleSave?: (jobId: string) => void
}

export const JobCard = memo(function JobCard({ job, isSaved, onToggleSave }: JobCardProps) {
  const salary = formatSalary(job, null)
  const [showCompanyModal, setShowCompanyModal] = useState(false)

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSave?.(job.id)
  }

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowCompanyModal(true)
  }

  return (
    <>
    <Link href={`/jobs/${job.id}`}
      className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30">
      {onToggleSave && (
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={isSaved ? 'ยกเลิกบันทึกงาน' : 'บันทึกงาน'}
          aria-pressed={isSaved}
          className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            isSaved ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      )}

      <div className="flex items-start justify-between gap-3 pr-10">
        <div className="flex items-start gap-3">
          <button type="button" onClick={handleCompanyClick} aria-label={`ดูข้อมูล ${job.company.name}`}>
            <CompanyLogo name={job.company.name} logoUrl={job.company.logoUrl} size="sm" />
          </button>
          <div>
            <h3 className="font-semibold text-gray-900">{job.title}</h3>
            <button type="button" onClick={handleCompanyClick}
              className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 hover:underline">
              <Building2 className="h-3.5 w-3.5" /> {job.company.name}
            </button>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
          {JOB_TYPE_LABELS[job.jobType]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
        {salary && <span className="font-medium text-gray-700">{salary}</span>}
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" /> {new Date(job.createdAt).toLocaleDateString('th-TH')}
        </span>
      </div>

      {job.category && (
        <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{job.category.name}</span>
      )}
    </Link>
    {showCompanyModal && (
      <CompanyQuickViewModal companyId={job.company.id} onClose={() => setShowCompanyModal(false)} />
    )}
    </>
  )
})
