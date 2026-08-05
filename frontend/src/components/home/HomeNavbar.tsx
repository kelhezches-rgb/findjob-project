'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'
import { Logo } from '@/components/brand/Logo'
import { MemberMenu, SEEKER_MENU_ITEMS, EMPLOYER_MENU_ITEMS, ADMIN_MENU_ITEMS } from '@/components/home/MemberMenu'

const NAV_LINKS = [
  { href: '/jobs', label: 'ค้นหางาน' },
  { href: '#',     label: 'บริษัท' },
  { href: '#',     label: 'เงินเดือน' },
  { href: '#',     label: 'บทความ' },
]

export function HomeNavbar() {
  const { user, isLoading, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? 'bg-[#0F0F23]/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo variant="icon" href="/" className="gap-2" priority>
            <span className="text-lg font-bold tracking-tight text-white">JobBoard</span>
          </Logo>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/80">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" aria-hidden="true" />
            ) : user ? (
              <MemberMenu user={user} />
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

            {!isLoading && !user && (
              <Link href="/auth/login" className="hover:text-white" onClick={() => setMobileOpen(false)}>
                เข้าสู่ระบบ
              </Link>
            )}

            {!isLoading && user && (
              <>
                <div className="my-1 border-t border-white/10" />
                {(user.role === 'seeker' ? SEEKER_MENU_ITEMS
                  : user.role === 'employer' ? EMPLOYER_MENU_ITEMS
                  : ADMIN_MENU_ITEMS
                ).map((item, i) => (
                  <Link key={`${item.href}-${i}`} href={item.href} className="flex items-center gap-2 hover:text-white"
                    onClick={() => setMobileOpen(false)}>
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="flex items-center gap-2 text-left text-red-300 hover:text-red-200"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  ออกจากระบบ
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
