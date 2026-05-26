import { create } from 'zustand'
import i18n from '../lib/i18n'

export type AppLanguage = 'ne' | 'ja' | 'en'

export interface AppUser {
  id: string
  email: string
  name: string
}

export interface AppSession {
  accessToken: string
  refreshToken: string
}

interface AuthStore {
  user: AppUser | null
  session: AppSession | null
  isLoading: boolean
  error: string | null
  language: AppLanguage
  isAuthenticated: boolean
  setUser: (user: AppUser | null) => void
  setSession: (session: AppSession | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLanguage: (language: AppLanguage) => void
  signOut: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  language: 'ne',
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  setSession: (session) => set({ session }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setLanguage: (language) => {
    i18n.changeLanguage(language)
    set({ language })
  },

  signOut: () =>
    set({ user: null, session: null, isAuthenticated: false, error: null }),
}))
