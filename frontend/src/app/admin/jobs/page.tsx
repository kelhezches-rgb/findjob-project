'use client'
import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner, PaginationBar, EmptyState } from '@/components/ui'
import { Pagination } from '@/types'

interface AdminJob {
  id: string; title: string; status: string; jobType: string
  createdAt: string; company: { name: string }
  category?: { name: string } | null
  _count: { applications: number }
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get('/admin/jobs', { params: { q, status, page, limit: 20 } })
      setJobs(data.jobs); setPagination(data.pagination)
    } finally { setIsLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [q, status, page])

  const changeStatus = async (id: string, newStatus: string) => {
    await api.patch(`/admin/jobs/${id}/status`, { status: newStatus })
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j))
  }

  const deleteJob = async (id: string, title: string) => {
    if (!confirm(`ลบงาน "${title}" ใช่หรือไม่?`)) return
    await api.delete(`/admin/jobs/${id}`)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">จัดการประกาศงาน</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="ค้นหาชื่องาน..."
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500">
          <option value="">ทุกสถานะ</option>
          {['draft','active','closed','expired'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && jobs.length === 0 && <EmptyState icon={<Search className="h-12 w-12" />} title="ไม่พบประกาศงาน" />}

      {!isLoading && jobs.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ตำแหน่งงาน</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">บริษัท</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">ผู้สมัคร</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{job.title}</p>
                    <p className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString('th-TH')}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{job.company.name}</td>
                  <td className="px-4 py-3">
                    <select value={job.status} onChange={e => changeStatus(job.id, e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none">
                      {['draft','active','closed','expired'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{job._count.applications} คน</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => deleteJob(job.id, job.title)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
    </div>
  )
}
