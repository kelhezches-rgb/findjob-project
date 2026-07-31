'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { SeekerNavbar } from '@/components/layout'
import { JobSearchBar } from '@/components/jobs/JobSearchBar'
import { JobCard } from '@/components/jobs/JobCard'
import { EmptyState, JobCardSkeleton, LoadingSpinner, PaginationBar } from '@/components/ui'
import { useJobSearch, useCategories, useSavedJobs, JobFilters } from '@/hooks'
import { useAuth } from '@/hooks/useAuth'

const SORT_LABELS: Record<NonNullable<JobFilters['sort']>, string> = {
  latest: 'ล่าสุด',
  oldest: 'เก่าสุด',
  salary_desc: 'เงินเดือน สูง -> ต่ำ',
  salary_asc: 'เงินเดือน ต่ำ -> สูง',
}

// Bug fix (Phase 7 audit): this page previously always started from a
// hardcoded { page: 1 }, silently ignoring any ?q=&province=... handed off
// by the home page's search bar — so a home-page search would land here
// and show the *unfiltered* list. Seed initial filters from the URL instead.
function filtersFromSearchParams(searchParams: URLSearchParams): JobFilters {
  const initial: JobFilters = { page: 1 }
  const q = searchParams.get('q')
  const province = searchParams.get('province')
  const district = searchParams.get('district')
  const subDistrict = searchParams.get('subDistrict')
  const categoryId = searchParams.get('categoryId')
  const jobType = searchParams.get('jobType')
  const sort = searchParams.get('sort') as JobFilters['sort'] | null
  if (q) initial.q = q
  if (province) initial.province = province
  if (district) initial.district = district
  if (subDistrict) initial.subDistrict = subDistrict
  if (categoryId) initial.categoryId = categoryId
  if (jobType) initial.jobType = jobType
  if (sort) initial.sort = sort
  return initial
}

function JobsPageContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<JobFilters>(() => filtersFromSearchParams(searchParams))
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

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50"><LoadingSpinner /></div>}>
      <JobsPageContent />
    </Suspense>
  )
}
