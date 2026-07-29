'use client'
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { User } from '@/types'

export function useAuth() {
  const router = useRouter()
  const { user, accessToken, isLoading, setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    if (accessToken) { setLoading(false); return }
    const restore = async () => {
      try {
        const { data: r } = await api.post<{ accessToken: string }>('/auth/refresh')
        useAuthStore.getState().setAccessToken(r.accessToken)
        const { data: m } = await api.get<{ user: User }>('/auth/me')
        setAuth(m.user, r.accessToken)
      } catch { clearAuth() }
    }
    restore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ user: User; accessToken: string }>('/auth/login', { email, password })
      setAuth(data.user, data.accessToken)
      if (data.user.role === 'seeker')   router.push('/jobs')
      if (data.user.role === 'employer') router.push('/employer/jobs')
      if (data.user.role === 'admin')    router.push('/admin/dashboard')
      return { success: true as const }
    } catch (e) {
      const err = e as AxiosError<{ message: string }>
      return { success: false as const, message: err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ' }
    }
  }, [router, setAuth])

  const register = useCallback(async (input: Record<string, string>) => {
    try {
      const { data } = await api.post<{ user: User; accessToken: string }>('/auth/register', input)
      setAuth(data.user, data.accessToken)
      if (data.user.role === 'seeker')   router.push('/seeker/profile')
      if (data.user.role === 'employer') router.push('/employer/company')
      return { success: true as const }
    } catch (e) {
      const err = e as AxiosError<{ message: string }>
      return { success: false as const, message: err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ' }
    }
  }, [router, setAuth])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } finally { clearAuth(); router.push('/auth/login') }
  }, [clearAuth, router])

  return { user, accessToken, isLoading, login, register, logout }
}
