'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, PlusCircle, Briefcase, Users, Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { MobileNavDrawer, MobileNavTrigger } from '@/components/layout/MobileNavDrawer'

// Shared safe-area-aware sticky header padding — every top bar in the app
// uses this same value so headers are visually consistent and never sit
// under an iPhone notch/status bar when the app is edge-to-edge.
const HEADER_SAFE_TOP = { paddingTop: 'env(safe-area-inset-top)' }

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
  const displayName = [user?.jobSeeker?.firstName, user?.jobSeeker?.lastName].filter(Boolean).join(' ')

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur" style={HEADER_SAFE_TOP}>
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
              {displayName}
            </Link>
            <button onClick={logout} className="min-h-touch rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">ออก</button>
          </div>
          <MobileNavTrigger open={drawerOpen} onClick={() => setDrawerOpen(true)} />
        </div>
      </header>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={SEEKER_NAV_ITEMS}
        subtitle={displayName || null}
        onLogout={logout}
        ariaLabel="เมนูผู้หางาน"
      />
    </>
  )
}

// Single source of truth for employer navigation — both the desktop bar
// and the mobile drawer render from this exact list, so they can't drift.
// Each item's `match` explicitly decides when it's active — a plain
// startsWith can't tell /employer/jobs, /employer/jobs/create, and
// /employer/jobs/[id]/applicants apart since they share a path prefix.
// Note: this app has no dedicated "Account Settings" page — it points at
// its closest existing equivalent until one is built.
const EMPLOYER_NAV_ITEMS = [
  {
    href: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard,
    match: (p: string) => p.startsWith('/employer/dashboard'),
  },
  {
    href: '/employer/company', label: 'บริษัท', icon: Building2,
    match: (p: string) => p.startsWith('/employer/company'),
  },
  {
    href: '/employer/jobs/create', label: 'ลงประกาศงาน', icon: PlusCircle,
    match: (p: string) => p === '/employer/jobs/create',
  },
  {
    // Matches the jobs list itself and the edit page
    // (/employer/jobs/[id]/edit) — but not /create or /applicants.
    href: '/employer/jobs', label: 'ประกาศงาน', icon: Briefcase,
    match: (p: string) => p === '/employer/jobs' || /^\/employer\/jobs\/[^/]+\/edit$/.test(p),
  },
  {
    // Matches the dedicated applications page and any per-job applicants
    // route (list or detail) — never the same paths "ประกาศงาน" matches.
    href: '/employer/applications', label: 'ใบสมัครงาน', icon: Users,
    match: (p: string) => p.startsWith('/employer/applications') || /^\/employer\/jobs\/[^/]+\/applicants/.test(p),
  },
  {
    href: '/employer/settings', label: 'ตั้งค่าบัญชี', icon: Settings,
    match: (p: string) => p.startsWith('/employer/settings'),
  },
]

export function EmployerNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const companyName = user?.employer?.company?.name

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur" style={HEADER_SAFE_TOP}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo variant="icon" href="/" className="min-w-0 shrink-0 gap-2">
            <span className="text-base font-bold text-navy-800">JobBoard</span>
            <span className="hidden text-xs text-gray-400 sm:inline">for Employers</span>
          </Logo>

          <nav className="hidden md:flex items-center gap-1">
            {EMPLOYER_NAV_ITEMS.map((l, i) => (
              <Link key={`${l.href}-${i}`} href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${l.match(pathname || '') ? 'bg-navy-50 text-navy-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span className="max-w-[10rem] truncate text-sm text-gray-500">{companyName}</span>
            <button onClick={logout} className="min-h-touch rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">ออก</button>
          </div>

          <MobileNavTrigger open={drawerOpen} onClick={() => setDrawerOpen(true)} />
        </div>
      </header>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={EMPLOYER_NAV_ITEMS}
        subtitle={companyName || null}
        onLogout={logout}
        ariaLabel="เมนูนายจ้าง"
      />
    </>
  )
}

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users',     label: 'Users' },
  { href: '/admin/jobs',      label: 'Jobs' },
  { href: '/admin/companies', label: 'Companies' },
]

// Same shared list, now also feeding the mobile drawer (previously
// AdminNavbar had no mobile nav at all — the nav row had no `hidden
// md:flex`, so on a narrow viewport it just overflowed horizontally).
const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',      icon: Users },
  { href: '/admin/jobs',      label: 'Jobs',       icon: Briefcase },
  { href: '/admin/companies', label: 'Companies',  icon: Building2 },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur" style={HEADER_SAFE_TOP}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Logo variant="icon" href="/" className="min-w-0 shrink-0 gap-2">
            <span className="truncate text-base font-bold text-gray-900">Admin Panel</span>
          </Logo>
          <nav className="hidden md:flex items-center gap-1">
            {ADMIN_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${pathname?.startsWith(l.href) ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <button onClick={logout} className="hidden min-h-touch rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 md:block">ออก</button>
          <MobileNavTrigger open={drawerOpen} onClick={() => setDrawerOpen(true)} />
        </div>
      </header>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={ADMIN_NAV_ITEMS}
        subtitle="Admin Panel"
        onLogout={logout}
        ariaLabel="เมนูผู้ดูแลระบบ"
      />
    </>
  )
}
