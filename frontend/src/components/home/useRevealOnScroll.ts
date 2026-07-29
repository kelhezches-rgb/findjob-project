'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref + boolean; the boolean flips to true once the element
 * scrolls into view, so callers can toggle a fade-up transition class.
 * Local to components/home/ — not a shared app-wide hook.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}
