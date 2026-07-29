'use client'
import { useEffect, useState } from 'react'
import { Search, ShieldCheck, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner, PaginationBar, EmptyState } from '@/components/ui'
import { Pagination } from '@/types'

interface AdminCompany {
  id: string; name: string; industry?: string | null; province?: string | null
  isVerified: boolean; createdAt: string
  _count: { jobs: number; employers: number }
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const fetch = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get('/admin/companies', { params: { q, page, limit: 20 } })
      setCompanies(data.companies); setPagination(data.pagination)
    } finally { setIsLoading(false) }
  }

  useEffect(() => { fetch() }, [q, page])

  const toggleVerify = async (id: string, current: boolean) => {
    await api.patch(`/admin/companies/${id}/verify`, { isVerified: !current })
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, isVerified: !current } : c))
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">จัดการบริษัท</h1>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="ค้นหาชื่อบริษัท..."
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && companies.length === 0 && <EmptyState icon={<Search className="h-12 w-12" />} title="ไม่พบบริษัท" />}

      {!isLoading && companies.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">บริษัท</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">อุตสาหกรรม</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">งาน / HR</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Verified</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.province || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{c.industry || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{c._count.jobs} งาน · {c._count.employers} HR</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${c.isVerified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isVerified ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                      {c.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => toggleVerify(c.id, c.isVerified)}
                        className={`rounded-lg p-2 transition-colors ${c.isVerified ? 'text-green-600 hover:bg-red-50 hover:text-red-600' : 'text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                        title={c.isVerified ? 'ยกเลิก Verify' : 'Verify บริษัท'}>
                        {c.isVerified ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
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
