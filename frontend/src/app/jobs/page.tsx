'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { SeekerNavbar } from '@/components/layout'
import { JobSearchBar } from '@/components/jobs/JobSearchBar'
import { JobCard } from '@/components/jobs/JobCard'
import { EmptyState, JobCardSkeleton, PaginationBar } from '@/components/ui'
import { useJobSearch, useCategories, useSavedJobs, JobFilters } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'

const SORT_LABELS: Record<NonNullable<JobFilters['sort']>, string> = {
  latest: 'ล่าสุด',
  oldest: 'เก่าสุด',
  salary_desc: 'เงินเดือน สูง -> ต่ำ',
  salary_asc: 'เงินเดือน ต่ำ -> สูง',
}

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({ page: 1 })
  const { categories } = useCategories()
  const { jobs, pagination, isLoading, error } = useJobSearch(filters)
  const { user } = useAuth()
  const { savedIds, toggle } = useSavedJobs()
  const isSeeker = user?.role === 'seeker'

  return (
    <div className="min-h-screen bg-gray-50">
      <SeekerNavbar />

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">ค้นหางาน</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? 'กำลังค้นหา...' : pagination ? `พบ ${pagination.total} ตำแหน่งงาน` : ''}
          </p>
        </div>

        <div className="mb-6">
          <JobSearchBar filters={filters} categories={categories} onChange={setFilters} />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!isLoading && jobs.length > 0 && (
          <div className="mb-3 flex justify-end">
            <select
              value={filters.sort || 'latest'}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value as JobFilters['sort'], page: 1 }))}
              aria-label="เรียงลำดับ"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {(Object.keys(SORT_LABELS) as JobFilters['sort'][]).map(opt => (
                <option key={opt} value={opt}>{SORT_LABELS[opt!]}</option>
              ))}
            </select>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState icon={<Search className="h-12 w-12" />} title="ไม่พบตำแหน่งงานที่ตรงกับเงื่อนไข" description="ลองปรับตัวกรองดู" />
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={isSeeker ? savedIds.has(job.id) : undefined}
                onToggleSave={isSeeker ? toggle : undefined}
              />
            ))}
          </div>
        )}

        {pagination && (
          <PaginationBar pagination={pagination} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
        )}
      </main>
    </div>
  )
}
