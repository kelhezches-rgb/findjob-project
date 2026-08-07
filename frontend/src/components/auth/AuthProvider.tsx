'use client'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { User } from '@/types'

// Module-level (not component-level) so it survives React StrictMode's
// dev-mode double-mount, but still resets on every real full page load —
// which is exactly the one restore attempt we want per load.
let hasStartedRestore = false

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (hasStartedRestore) return
    hasStartedRestore = true

    const { accessToken, setAuth, clearAuth, setLoading } = useAuthStore.getState()
    if (accessToken) { setLoading(false); return }

    const restore = async () => {
      try {
        const { data } = await api.post<{ user: User; accessToken: string }>('/auth/refresh')
        setAuth(data.user, data.accessToken)
      } catch (e: any) {
        // Only a confirmed response (401/403 — refresh token explicitly
        // rejected) means the session is actually invalid. A network-level
        // failure with no response is ambiguous (offline, blocked, CORS) —
        // don't assert "logged out" for that, just stop initializing.
        if (e?.response) clearAuth()
        else setLoading(false)
      }
    }
    restore()
  }, [])

  return <>{children}</>
}
