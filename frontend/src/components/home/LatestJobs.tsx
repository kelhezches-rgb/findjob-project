'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { useRevealOnScroll } from './useRevealOnScroll'
import { latestJobs, JOB_TYPE_LABELS, JOB_TYPE_FILTERS } from './mockData'
import type { MockJob } from './mockData'

function JobRow({ job }: { job: MockJob }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-[#4F46E5]/30 hover:shadow-sm"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${job.companyColor}`}>
        {job.companyInitial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
          {job.isNew && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-[#10B981]">ใหม่</span>
          )}
          {job.jobType === 'remote' && (
            <span className="rounded-full bg-[#E8E7FF] px-2 py-0.5 text-xs font-medium text-[#4F46E5]">Remote</span>
          )}
          {job.jobType === 'part_time' && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">พาร์ทไทม์</span>
          )}
          {job.jobType === 'internship' && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-600">ฝึกงาน</span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">{job.company} · {job.location}</p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-sm font-semibold text-gray-900">{job.salaryLabel}</p>
        <p className="mt-0.5 text-xs text-gray-500">{JOB_TYPE_LABELS[job.jobType]}</p>
      </div>

      <span className="hidden shrink-0 text-xs text-gray-400 md:block">{job.postedLabel}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
    </Link>
  )
}

export function LatestJobs() {
  const { ref, isVisible } = useRevealOnScroll()
  const [activeFilter, setActiveFilter] = useState<typeof JOB_TYPE_FILTERS[number]['value']>('all')

  const filteredJobs = activeFilter === 'all'
    ? latestJobs
    : latestJobs.filter((j) => j.jobType === activeFilter)

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`mb-8 flex items-end justify-between transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#10B981]">อัปเดตล่าสุด</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Latest Jobs</h2>
            <p className="mt-1 text-sm text-gray-500">ตำแหน่งงานใหม่ที่เพิ่งลงประกาศ</p>
          </div>
          <Link href="/jobs" className="hidden items-center gap-1 text-sm font-medium text-[#4F46E5] hover:underline sm:flex">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {JOB_TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeFilter === f.value
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filteredJobs.map((job) => <JobRow key={job.id} job={job} />)}
        </div>

        <div className="mt-8 text-center">
          <Link href="/jobs">
            <Button variant="secondary" size="lg" className="!border-2 !border-[#4F46E5] !bg-white !text-[#4F46E5] hover:!bg-[#4F46E5] hover:!text-white">
              ดูตำแหน่งงานทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
