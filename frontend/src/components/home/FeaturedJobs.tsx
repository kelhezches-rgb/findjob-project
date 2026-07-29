'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useRevealOnScroll } from './useRevealOnScroll'
import { featuredJobs, JOB_TYPE_LABELS } from './mockData'
import type { MockFeaturedJob } from './mockData'

function FeaturedJobCard({ job }: { job: MockFeaturedJob }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="featured-card group relative flex cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5"
    >
      {/* Gradient border glow on hover — scoped styled-jsx, no global CSS touched */}
      <style jsx>{`
        .featured-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .featured-card:hover::before {
          opacity: 1;
        }
      `}</style>

      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${job.companyColor}`}>
            {job.companyInitial}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">{job.company}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span className="text-xs font-medium text-[#10B981]">กำลังรับสมัคร</span>
            </div>
          </div>
        </div>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-[#7C3AED]">⭐ Featured</span>
      </div>

      <h3 className="mb-1 font-semibold text-gray-900">{job.title}</h3>
      <p className="mb-4 text-sm text-gray-500 line-clamp-2">{job.description}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <p className="text-sm font-bold text-gray-900">{job.salaryLabel}</p>
          <p className="text-xs text-gray-500">{job.location} · {JOB_TYPE_LABELS[job.jobType]}</p>
        </div>
        <span className="rounded-xl bg-[#E8E7FF] px-3 py-1.5 text-xs font-semibold text-[#4F46E5] transition-colors group-hover:bg-[#4F46E5] group-hover:text-white">
          สมัครเลย
        </span>
      </div>
    </Link>
  )
}

export function FeaturedJobs() {
  const { ref, isVisible } = useRevealOnScroll()

  return (
    <section className="border-y border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`mb-8 flex items-end justify-between transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#7C3AED]">ไม่ควรพลาด</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Featured Jobs</h2>
            <p className="mt-1 text-sm text-gray-500">ตำแหน่งงานพรีเมียมจากบริษัทชั้นนำ</p>
          </div>
          <Link href="/jobs" className="hidden items-center gap-1 text-sm font-medium text-[#4F46E5] hover:underline sm:flex">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredJobs.map((job) => <FeaturedJobCard key={job.id} job={job} />)}
        </div>
      </div>
    </section>
  )
}
