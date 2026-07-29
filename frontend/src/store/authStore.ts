import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, accessToken: null, isLoading: true,
  setAuth:        (user, accessToken) => set({ user, accessToken, isLoading: false }),
  setAccessToken: (accessToken)       => set({ accessToken }),
  clearAuth:      ()                  => set({ user: null, accessToken: null, isLoading: false }),
  setLoading:     (isLoading)         => set({ isLoading }),
}))
