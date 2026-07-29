'use client'
import { useAdminStats } from '@/hooks'
import { LoadingSpinner, Badge } from '@/components/ui'

function StatCard({ label, value, color = 'text-indigo-600' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { stats, isLoading } = useAdminStats()
  if (isLoading) return <LoadingSpinner />
  if (!stats) return null

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="ผู้ใช้งานทั้งหมด" value={stats.totalUsers} color="text-indigo-600" />
        <StatCard label="งานทั้งหมด" value={stats.totalJobs} color="text-violet-600" />
        <StatCard label="งานที่เปิดรับสมัคร" value={stats.activeJobs} color="text-green-600" />
        <StatCard label="บริษัททั้งหมด" value={stats.totalCompanies} color="text-blue-600" />
        <StatCard label="ใบสมัครทั้งหมด" value={stats.totalApplications} color="text-amber-600" />
        <StatCard label="ผู้ใช้ใหม่เดือนนี้" value={stats.newUsersThisMonth} color="text-emerald-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Jobs by Status</h2>
          {Object.entries(stats.jobsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <Badge label={status} variant={status} />
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Applications by Status</h2>
          {Object.entries(stats.appsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <Badge label={status} variant={status} />
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
