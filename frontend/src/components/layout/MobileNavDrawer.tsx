'use client'
import { useEffect, ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, LogOut, Menu } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

export interface MobileNavItem {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

interface MobileNavDrawerProps {
  open: boolean
  onClose: () => void
  items: MobileNavItem[]
  /** Shown under the header row — e.g. the user's name or company name. */
  subtitle?: string | null
  onLogout: () => void
  ariaLabel: string
}

// Used by Seeker/Employer/Admin navbars — one implementation instead of
// three near-identical ones. Always render this as a SIBLING of your
// <header>, never nested inside it: a backdrop-blur header becomes the
// containing block for position:fixed descendants (CSS spec), which is
// what caused the transparent/clipped drawer bug this consolidation fixes
// at the source instead of per-navbar.
export function MobileNavDrawer({ open, onClose, items, subtitle, onLogout, ariaLabel }: MobileNavDrawerProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close automatically if the route changes underneath the drawer.
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="menu"
        aria-label={ariaLabel}
        className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col overflow-y-auto rounded-l-2xl border-l border-gray-200 bg-white shadow-xl animate-drawer-in-right"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
          <Logo variant="icon" href="/" className="min-w-0 gap-2">
            <span className="truncate text-base font-bold text-navy-800">JobBoard</span>
          </Logo>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {subtitle && (
          <p className="shrink-0 truncate border-b border-gray-100 px-4 py-2.5 text-sm text-gray-500">{subtitle}</p>
        )}

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((item, i) => {
            const active = pathname?.startsWith(item.href)
            return (
              <Link
                key={`${item.href}-${i}`}
                href={item.href}
                role="menuitem"
                className={`flex min-h-touch shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors
                  ${active ? 'bg-navy-50 text-navy-800' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={onLogout}
            role="menuitem"
            className="flex min-h-touch w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  )
}

// Shared hamburger trigger button — same touch target/size everywhere.
export function MobileNavTrigger({ onClick, open }: { onClick: () => void; open: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="เปิดเมนู"
      aria-haspopup="menu"
      aria-expanded={open}
      className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}
