'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Category, JobType } from '@/types'
import { JobFilters } from '@/hooks'
import { groupCategories } from '@/lib/categories'
import { findProvinceByName } from '@/lib/thai-locations'
import { ThaiLocationPicker, ThaiLocationValue } from '@/components/location/ThaiLocationPicker'

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

  // IDs live only here (never in filters/URL) so the picker stays visually
  // correct across re-renders. Lazily seeded from filters.province — e.g.
  // when the home page hands off "?province=ชลบุรี" to this page.
  const [location, setLocation] = useState<ThaiLocationValue>(() => {
    const province = filters.province
    const match = province ? findProvinceByName(province) : undefined
    return { province, provinceId: match?.id, district: filters.district, subDistrict: filters.subDistrict }
  })

  const handleLocationChange = (loc: ThaiLocationValue) => {
    setLocation(loc)
    onChange({ ...filters, province: loc.province, district: loc.district, subDistrict: loc.subDistrict, page: 1 })
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4">
      <div className="relative md:col-span-2">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="ค้นหาตำแหน่งงาน บริษัท หรือคำสำคัญ"
          value={filters.q || ''} onChange={e => onChange({ ...filters, q: e.target.value, page: 1 })}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      </div>

      <select value={filters.jobType || ''} onChange={e => onChange({ ...filters, jobType: e.target.value, page: 1 })}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:col-span-2">
        <option value="">ทุกประเภทงาน</option>
        {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map(type => (
          <option key={type} value={type}>{JOB_TYPE_LABELS[type]}</option>
        ))}
      </select>

      <div className="md:col-span-4">
        <ThaiLocationPicker value={location} onChange={handleLocationChange} />
      </div>

      <select value={filters.categoryId || ''} onChange={e => onChange({ ...filters, categoryId: e.target.value, page: 1 })}
        className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:col-span-4">
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
