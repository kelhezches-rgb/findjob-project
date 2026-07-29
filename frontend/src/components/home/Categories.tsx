'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useRevealOnScroll } from './useRevealOnScroll'
import { categories } from './mockData'

export function Categories() {
  const { ref, isVisible } = useRevealOnScroll()

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
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4F46E5]">หมวดหมู่</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">ค้นหาตามสายงาน</h2>
          </div>
          <Link href="/jobs" className="hidden items-center gap-1 text-sm font-medium text-[#4F46E5] hover:underline sm:flex">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href="/jobs"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-5 text-center transition-all hover:border-[#4F46E5] hover:bg-[#4F46E5] hover:-translate-y-0.5"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900 group-hover:text-white">{cat.name}</p>
                <p className="mt-0.5 text-xs text-gray-500 group-hover:text-white/70">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
