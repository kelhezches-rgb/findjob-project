import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Backend origin without the /api suffix — used to build full URLs to
// uploaded files served from /uploads (CVs, company logos, cover images).
export const API_ORIGIN = API_URL.replace('/api', '')

export const api = axios.create({ baseURL: API_URL, withCredentials: true })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = false
let queue: Array<() => void> = []

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || orig._retry || orig.url?.includes('/auth/')) {
      return Promise.reject(error)
    }
    if (refreshing) {
      await new Promise<void>((resolve) => queue.push(resolve))
      orig._retry = true
      return api(orig)
    }
    orig._retry = true
    refreshing  = true
    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      useAuthStore.getState().setAccessToken(data.accessToken)
      queue.forEach((r) => r())
      queue = []
      return api(orig)
    } catch (refreshError) {
      queue = []
      // Only a confirmed response (401/403 = refresh token explicitly
      // rejected) means the session is actually invalid — clear it and
      // send the user to log in again. A network-level failure with no
      // response (offline, CORS, timeout) is ambiguous; don't wipe a
      // possibly-still-valid session over that.
      if (axios.isAxiosError(refreshError) && refreshError.response) {
        useAuthStore.getState().clearAuth()
        if (typeof window !== 'undefined') window.location.href = '/auth/login'
      }
      return Promise.reject(error)
    } finally {
      refreshing = false
    }
  }
)
