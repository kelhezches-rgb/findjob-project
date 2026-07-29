'use client'
import { useEffect, useState } from 'react'
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, LoadingSpinner, PaginationBar, EmptyState } from '@/components/ui'
import { Pagination } from '@/types'

interface AdminUser {
  id: string; email: string; role: string
  isActive: boolean; isVerified: boolean; createdAt: string
  jobSeeker?: { firstName: string; lastName: string } | null
  employer?:  { company?: { name: string } | null } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get('/admin/users', { params: { q, role, page, limit: 20 } })
      setUsers(data.users); setPagination(data.pagination)
    } finally { setIsLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [q, role, page])

  const toggleActive = async (id: string, current: boolean) => {
    await api.patch(`/admin/users/${id}`, { isActive: !current })
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u))
  }

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`ลบผู้ใช้ ${email} ใช่หรือไม่?`)) return
    await api.delete(`/admin/users/${id}`)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const displayName = (u: AdminUser) => {
    if (u.jobSeeker) return `${u.jobSeeker.firstName} ${u.jobSeeker.lastName}`
    if (u.employer?.company) return u.employer.company.name
    return '—'
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">จัดการผู้ใช้งาน</h1>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="ค้นหาอีเมล..."
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500">
          <option value="">ทุก Role</option>
          <option value="seeker">Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && users.length === 0 && <EmptyState icon={<Search className="h-12 w-12" />} title="ไม่พบผู้ใช้งาน" />}

      {!isLoading && users.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ผู้ใช้</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">ชื่อ / บริษัท</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">สมัครเมื่อ</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-medium text-gray-900 truncate max-w-[180px]">{u.email}</p></td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{displayName(u)}</td>
                  <td className="px-4 py-3"><Badge label={u.role} variant={u.role} /></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(u.id, u.isActive)}
                        className={`rounded-lg p-2 transition-colors ${u.isActive ? 'text-gray-400 hover:bg-red-50 hover:text-red-600' : 'text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                        title={u.isActive ? 'Ban user' : 'Unban user'}>
                        {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button onClick={() => deleteUser(u.id, u.email)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
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
