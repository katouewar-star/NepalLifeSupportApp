import { create } from 'zustand'

export type TranslationDirection = 'ja-ne' | 'ne-ja'

export interface TranslationHistoryItem {
  id: string
  sourceText: string
  translatedText: string
  direction: TranslationDirection
  createdAt: Date
}

interface TranslationStore {
  history: TranslationHistoryItem[]
  isLoading: boolean
  error: string | null
  addHistory: (item: Omit<TranslationHistoryItem, 'id' | 'createdAt'>) => void
  clearHistory: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const MAX_HISTORY = 20

export const useTranslationStore = create<TranslationStore>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  addHistory: (item) =>
    set((state) => {
      const newItem: TranslationHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
      }
      const updated = [newItem, ...state.history]
      return { history: updated.slice(0, MAX_HISTORY) }
    }),

  clearHistory: () => set({ history: [] }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}))
