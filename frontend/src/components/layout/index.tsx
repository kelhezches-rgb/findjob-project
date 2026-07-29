'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const SEEKER_LINKS = [
  { href: '/jobs',                 label: 'ค้นหางาน' },
  { href: '/seeker/resumes',       label: 'Resume' },
  { href: '/seeker/cv-files',      label: 'ไฟล์ CV' },
  { href: '/seeker/applications',  label: 'งานที่สมัคร' },
  { href: '/seeker/saved-jobs',    label: 'บันทึกไว้' },
]

export function SeekerNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/jobs" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">J</div>
          <span className="text-base font-bold text-gray-900">JobBoard</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {SEEKER_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${pathname?.startsWith(l.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/seeker/profile" className="text-sm text-gray-600 hover:text-gray-900">
            {user?.jobSeeker?.firstName} {user?.jobSeeker?.lastName}
          </Link>
          <button onClick={logout} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">ออก</button>
        </div>
      </div>
    </header>
  )
}

// [แก้] เพิ่ม Dashboard เป็นลิงก์แยก เพราะตอนนี้ /employer/dashboard (สถิติภาพรวม)
// กับ /employer/jobs (รายการประกาศงาน) เป็นคนละหน้ากันแล้ว
const EMPLOYER_LINKS = [
  { href: '/employer/dashboard', label: 'Dashboard' },
  { href: '/employer/jobs',      label: 'ประกาศงาน' },
  { href: '/employer/company',   label: 'บริษัท' },
]

export function EmployerNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/employer/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">J</div>
          <span className="text-base font-bold text-gray-900">JobBoard</span>
          <span className="text-xs text-gray-400">for Employers</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {EMPLOYER_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${pathname?.startsWith(l.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.employer?.company?.name}</span>
          <button onClick={logout} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">ออก</button>
        </div>
      </div>
    </header>
  )
}

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users',     label: 'Users' },
  { href: '/admin/jobs',      label: 'Jobs' },
  { href: '/admin/companies', label: 'Companies' },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">A</div>
          <span className="text-base font-bold text-gray-900">Admin Panel</span>
        </div>
        <nav className="flex items-center gap-1">
          {ADMIN_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${pathname?.startsWith(l.href) ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">ออก</button>
      </div>
    </header>
  )
}
