'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

interface BackToTopProps {
  /** Scroll distance (px) before the button appears. */
  threshold?: number
}

export function BackToTop({ threshold = 400 }: BackToTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="กลับขึ้นด้านบน"
      title="กลับขึ้นด้านบน"
      // z-30: intentionally below the header (z-40) and any modal/drawer
      // (z-50/z-60) so it can never sit on top of those if they're open.
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        right: 'calc(1rem + env(safe-area-inset-right))',
      }}
      className="fixed z-30 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition-all duration-200 hover:bg-navy-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandOrange-400 focus-visible:ring-offset-2"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
