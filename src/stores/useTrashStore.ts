import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { fetchTrashRules, toDisplayRules } from '../lib/trash'
import type { TrashRule, TrashRuleDisplay } from '../lib/trash'
import { useAuthStore } from './useAuthStore'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface TrashStore {
  postalCode: string
  rules: TrashRule[]
  displayRules: TrashRuleDisplay[]   // 表示用・再計算可能（persistしない）
  isLoading: boolean
  error: string | null
  lastFetchedAt: number | null

  fetchRules: (postalCode: string) => Promise<void>
  refreshDisplayRules: () => void
  setPostalCode: (code: string) => void
  clearRules: () => void
}

export const useTrashStore = create<TrashStore>()(
  persist(
    (set, get) => ({
      postalCode: '',
      rules: [],
      displayRules: [],
      isLoading: false,
      error: null,
      lastFetchedAt: null,

      fetchRules: async (postalCode: string) => {
        const { postalCode: cachedCode, rules, lastFetchedAt } = get()
        const normalized = postalCode.replace(/-/g, '')

        const isCacheValid =
          cachedCode === normalized &&
          lastFetchedAt !== null &&
          Date.now() - lastFetchedAt < CACHE_TTL_MS &&
          rules.length > 0

        if (isCacheValid) {
          get().refreshDisplayRules()
          return
        }

        set({ isLoading: true, error: null, postalCode: normalized })

        const result = await fetchTrashRules(postalCode)

        if (result.ok) {
          const language = useAuthStore.getState().language
          const displayRules = toDisplayRules(result.rules, language)
          set({
            rules: result.rules,
            displayRules,
            isLoading: false,
            lastFetchedAt: Date.now(),
          })
        } else {
          set({
            rules: [],
            displayRules: [],
            isLoading: false,
            error: result.error,
            lastFetchedAt: null,
          })
        }
      },

      refreshDisplayRules: () => {
        const { rules } = get()
        const language = useAuthStore.getState().language
        set({ displayRules: toDisplayRules(rules, language) })
      },

      setPostalCode: (code) => set({ postalCode: code }),

      clearRules: () =>
        set({
          rules: [],
          displayRules: [],
          postalCode: '',
          error: null,
          lastFetchedAt: null,
        }),
    }),
    {
      name: 'trash-rules-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        postalCode: s.postalCode,
        rules: s.rules,
        lastFetchedAt: s.lastFetchedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.rules.length > 0) {
          state.refreshDisplayRules()
        }
      },
    }
  )
)
