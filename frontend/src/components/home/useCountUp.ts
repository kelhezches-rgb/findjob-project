'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number counting up from 0 to `target` once the returned
 * ref scrolls into view. Kept local to components/home/ so it never
 * touches the shared src/hooks barrel used by the rest of the app.
 */
export function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement | null>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const start = performance.now()

          const step = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
            setValue(target * eased)
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, durationMs])

  return { ref, value }
}
