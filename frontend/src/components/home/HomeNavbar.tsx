'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'

const NAV_LINKS = [
  { href: '/jobs', label: 'ค้นหางาน' },
  { href: '#',     label: 'บริษัท' },
  { href: '#',     label: 'เงินเดือน' },
  { href: '#',     label: 'บทความ' },
]

// Where a logged-in user's "dashboard" button should go, by role.
// This preserves the auth-aware behavior of the previous Home page —
// only the visual style changed to match the reference design.
const DASHBOARD_PATH: Record<string, string> = {
  seeker:   '/jobs',
  employer: '/employer/jobs',
  admin:    '/admin/dashboard',
}

export function HomeNavbar() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? 'bg-[#0F0F23]/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-sm font-bold text-white">
              J
            </div>
            <span className="text-lg font-bold tracking-tight text-white">JobBoard</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href={DASHBOARD_PATH[user.role] || '/jobs'}>
                <Button size="sm">เข้าสู่แดชบอร์ด</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">สมัครสมาชิก</Button>
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-1 text-white"
              aria-label="เมนู"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0F0F23] border-t border-white/10">
          <div className="flex flex-col gap-3 px-4 py-4 text-sm text-white/80">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link href="/auth/login" className="hover:text-white" onClick={() => setMobileOpen(false)}>
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
