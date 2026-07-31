'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown, User as UserIcon, FileText, Bookmark, ClipboardList, Settings, LogOut,
  LayoutDashboard, Building2, Briefcase, Users as UsersIcon, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { API_ORIGIN } from '@/lib/api'
import { CompanyLogo } from '@/components/company/CompanyLogo'
import { User } from '@/types'

interface MenuItem {
  href: string
  label: string
  icon: typeof UserIcon
}

// Exported so HomeNavbar's mobile panel renders the exact same links —
// one source of truth per role, never two lists that can drift apart.
export const SEEKER_MENU_ITEMS: MenuItem[] = [
  { href: '/seeker/profile',      label: 'โปรไฟล์ของฉัน',   icon: UserIcon },
  { href: '/seeker/resumes',      label: 'Resume ของฉัน',    icon: FileText },
  { href: '/seeker/saved-jobs',   label: 'งานที่บันทึกไว้',  icon: Bookmark },
  { href: '/seeker/applications', label: 'งานที่สมัคร',      icon: ClipboardList },
  { href: '/seeker/profile',      label: 'ตั้งค่าบัญชี',      icon: Settings },
]

export const EMPLOYER_MENU_ITEMS: MenuItem[] = [
  { href: '/employer/dashboard', label: 'แดชบอร์ดนายจ้าง',   icon: LayoutDashboard },
  { href: '/employer/company',   label: 'โปรไฟล์บริษัท',     icon: Building2 },
  { href: '/employer/jobs',      label: 'จัดการประกาศงาน',   icon: Briefcase },
  { href: '/employer/jobs',      label: 'ใบสมัครงาน',        icon: UsersIcon },
  { href: '/employer/company',   label: 'ตั้งค่าบัญชี',       icon: Settings },
]

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
]

function getMenuItems(role: string): MenuItem[] {
  if (role === 'seeker')   return SEEKER_MENU_ITEMS
  if (role === 'employer') return EMPLOYER_MENU_ITEMS
  if (role === 'admin')    return ADMIN_MENU_ITEMS
  return []
}

function getDisplayName(user: User): string {
  if (user.role === 'seeker' && user.jobSeeker) {
    return `${user.jobSeeker.firstName} ${user.jobSeeker.lastName}`.trim() || user.email
  }
  if (user.role === 'employer' && user.employer?.company) {
    return user.employer.company.name
  }
  return user.email
}

export function MemberMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const items = getMenuItems(user.role)
  const displayName = getDisplayName(user)
  const company = user.role === 'employer' ? user.employer?.company : null

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // Close on Escape, return focus to the trigger button
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const handleSelect = () => setOpen(false)
  const handleLogout = () => { setOpen(false); logout() }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        {company ? (
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} size="sm" className="h-7 w-7" />
        ) : user.jobSeeker?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_ORIGIN}${user.jobSeeker.avatarUrl}`}
            alt=""
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brandOrange-500 text-xs font-bold text-white">
            {displayName[0]?.toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="เมนูสมาชิก"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 text-gray-700 shadow-xl"
        >
          <div className="border-b border-gray-100 px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold text-navy-800">{displayName}</p>
            <p className="text-xs text-gray-400">
              {user.role === 'seeker' ? 'ผู้หางาน' : user.role === 'employer' ? 'นายจ้าง' : 'ผู้ดูแลระบบ'}
            </p>
          </div>

          {items.map((item, i) => (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              role="menuitem"
              onClick={handleSelect}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors hover:bg-navy-50 hover:text-navy-800"
            >
              <item.icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              {item.label}
            </Link>
          ))}

          <div className="mt-1 border-t border-gray-100 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
