'use client'
import { Search } from 'lucide-react'
import { Category, JobType } from '@/types'
import { JobFilters } from '@/hooks'
import { groupCategories } from '@/lib/categories'

const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'งานประจำ', part_time: 'พาร์ทไทม์', contract: 'สัญญาจ้าง',
  internship: 'ฝึกงาน', remote: 'ทำงานทางไกล',
}

interface JobSearchBarProps {
  filters: JobFilters
  categories: Category[]
  onChange: (filters: JobFilters) => void
}

export function JobSearchBar({ filters, categories, onChange }: JobSearchBarProps) {
  const categoryGroups = groupCategories(categories)

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4">
      <div className="relative md:col-span-2">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="ค้นหาตำแหน่งงาน บริษัท หรือคำสำคัญ"
          value={filters.q || ''} onChange={e => onChange({ ...filters, q: e.target.value, page: 1 })}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      </div>

      <input type="text" placeholder="สถานที่ทำงาน" value={filters.province || ''}
        onChange={e => onChange({ ...filters, province: e.target.value, page: 1 })}
        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />

      <select value={filters.jobType || ''} onChange={e => onChange({ ...filters, jobType: e.target.value, page: 1 })}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
        <option value="">ทุกประเภทงาน</option>
        {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map(type => (
          <option key={type} value={type}>{JOB_TYPE_LABELS[type]}</option>
        ))}
      </select>

      <select value={filters.categoryId || ''} onChange={e => onChange({ ...filters, categoryId: e.target.value, page: 1 })}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:col-span-3">
        <option value="">ทุกหมวดหมู่</option>
        {categoryGroups.map(g => (
          <optgroup key={g.group} label={g.group}>
            {g.categories.map(c => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  )
}
