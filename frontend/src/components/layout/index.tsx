'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Building2, PlusCircle, Briefcase, Users, Settings, LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'

const SEEKER_LINKS = [
  { href: '/jobs',                 label: 'ค้นหางาน' },
  { href: '/seeker/resumes',       label: 'Resume' },
  { href: '/seeker/cv-files',      label: 'ไฟล์ CV' },
  { href: '/seeker/applications',  label: 'งานที่สมัคร' },
  { href: '/seeker/saved-jobs',    label: 'บันทึกไว้' },
]

// Single source of truth for the seeker mobile drawer — every feature
// accessible on desktop (including account settings) must also be here.
const SEEKER_NAV_ITEMS = [
  ...SEEKER_LINKS.map(l => ({ ...l, icon: Briefcase })),
  { href: '/seeker/profile',  label: 'โปรไฟล์ของฉัน', icon: Users },
  { href: '/seeker/settings', label: 'ตั้งค่าบัญชี',   icon: Settings },
]

export function SeekerNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  useEffect(() => { setDrawerOpen(false) }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo variant="icon" href="/" className="min-w-0 shrink-0 gap-2">
          <span className="text-base font-bold text-navy-800">JobBoard</span>
        </Logo>
        <nav className="hidden md:flex items-center gap-1">
          {SEEKER_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${pathname?.startsWith(l.href) ? 'bg-navy-50 text-navy-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/seeker/profile" className="max-w-[10rem] truncate text-sm text-gray-600 hover:text-gray-900">
            {user?.jobSeeker?.firstName} {user?.jobSeeker?.lastName}
          </Link>
          <button onClick={logout} className="min-h-touch rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">ออก</button>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="เปิดเมนู"
          aria-haspopup="menu"
          aria-expanded={drawerOpen}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div role="menu" aria-label="เมนูผู้หางาน" className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <Logo variant="icon" href="/" className="min-w-0 gap-2">
                <span className="truncate text-base font-bold text-navy-800">JobBoard</span>
              </Logo>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="ปิดเมนู"
                className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {(user?.jobSeeker?.firstName || user?.jobSeeker?.lastName) && (
              <p className="truncate border-b border-gray-100 px-4 py-2.5 text-sm text-gray-500">
                {user.jobSeeker?.firstName} {user.jobSeeker?.lastName}
              </p>
            )}

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {SEEKER_NAV_ITEMS.map((l, i) => {
                const active = pathname?.startsWith(l.href)
                return (
                  <Link
                    key={`${l.href}-${i}`}
                    href={l.href}
                    role="menuitem"
                    className={`flex min-h-touch items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors
                      ${active ? 'bg-navy-50 text-navy-800' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <l.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {l.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); logout() }}
                role="menuitem"
                className="flex min-h-touch w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// Single source of truth for employer navigation — both the desktop bar
// and the mobile drawer render from this exact list, so they can't drift.
// Note: this app has no dedicated cross-job "Applications" page (applicants
// are only viewable per-job) and no dedicated "Account Settings" page —
// both point at their closest existing equivalent until those are built.
const EMPLOYER_NAV_ITEMS = [
  { href: '/employer/dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/employer/company',    label: 'บริษัท',          icon: Building2 },
  { href: '/employer/jobs/create',label: 'ลงประกาศงาน',     icon: PlusCircle },
  { href: '/employer/jobs',       label: 'ประกาศงาน',       icon: Briefcase },
  { href: '/employer/jobs',       label: 'ใบสมัครงาน',      icon: Users },
  { href: '/employer/settings',    label: 'ตั้งค่าบัญชี',     icon: Settings },
]

export function EmployerNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [drawerOpen])

  // Close the drawer on Escape.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  // Close the drawer automatically if the route changes underneath it.
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo variant="icon" href="/" className="min-w-0 shrink-0 gap-2">
          <span className="text-base font-bold text-navy-800">JobBoard</span>
          <span className="hidden text-xs text-gray-400 sm:inline">for Employers</span>
        </Logo>

        {/* Desktop nav — same items/behavior as before, just sourced from the shared list */}
        <nav className="hidden md:flex items-center gap-1">
          {EMPLOYER_NAV_ITEMS.map((l, i) => (
            <Link key={`${l.href}-${i}`} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${pathname?.startsWith(l.href) ? 'bg-navy-50 text-navy-800' : 'text-gray-600 hover:bg-gray-100'}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-[10rem] truncate text-sm text-gray-500">{user?.employer?.company?.name}</span>
          <button onClick={logout} className="min-h-touch rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">ออก</button>
        </div>

        {/* Mobile: hamburger trigger — every desktop feature above is also in the drawer below */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="เปิดเมนู"
          aria-haspopup="menu"
          aria-expanded={drawerOpen}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile full-screen drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div role="menu" aria-label="เมนูนายจ้าง" className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <Logo variant="icon" href="/" className="min-w-0 gap-2">
                <span className="truncate text-base font-bold text-navy-800">JobBoard</span>
              </Logo>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="ปิดเมนู"
                className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {user?.employer?.company?.name && (
              <p className="truncate border-b border-gray-100 px-4 py-2.5 text-sm text-gray-500">
                {user.employer.company.name}
              </p>
            )}

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {EMPLOYER_NAV_ITEMS.map((l, i) => {
                const active = pathname?.startsWith(l.href)
                return (
                  <Link
                    key={`${l.href}-${i}`}
                    href={l.href}
                    role="menuitem"
                    className={`flex min-h-touch items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors
                      ${active ? 'bg-navy-50 text-navy-800' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <l.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {l.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); logout() }}
                role="menuitem"
                className="flex min-h-touch w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
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
