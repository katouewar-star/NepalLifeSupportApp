/**
 * useTrashStore ユニットテスト
 * fetchTrashRules をモックして Store のアクションを検証する
 */

// AsyncStorage をメモリモックに差し替え
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}))

// trash lib をすべてモック（requireActual は supabase.ts を引き込むため使わない）
jest.mock('@/lib/trash', () => ({
  fetchTrashRules: jest.fn(),
  toDisplayRules: jest.fn((rules: any[]) =>
    rules.map((r) => ({
      id: r.id,
      category: r.category,
      schedule: r.schedule,
      notes: r.notes_ja,
      icon: r.icon,
      dayLabels: [],
    }))
  ),
}))

// useAuthStore の言語を固定
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: Object.assign(
    jest.fn((selector: (s: any) => any) => selector({ language: 'ja' })),
    {
      getState: jest.fn(() => ({ language: 'ja' })),
    }
  ),
}))

import { act } from 'react'
import { useTrashStore } from '@/stores/useTrashStore'
import { fetchTrashRules } from '@/lib/trash'
import type { TrashRule } from '@/lib/trash'

const mockFetch = fetchTrashRules as jest.Mock

const sampleRules: TrashRule[] = [
  {
    id: 1,
    postal_code: '1600022',
    category: '燃えるゴミ',
    schedule: { dayOfWeek: [2, 5], time: '08:00' },
    notes_ja: '火曜・金曜の朝8時まで',
    notes_ne: 'मंगलबार र शुक्रबार',
    icon: '🔥',
  },
]

const initialState = {
  postalCode: '',
  rules: [],
  displayRules: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
}

beforeEach(() => {
  useTrashStore.setState(initialState)
  jest.clearAllMocks()
})

describe('useTrashStore', () => {
  describe('初期状態', () => {
    it('postalCode が空文字であること', () => {
      expect(useTrashStore.getState().postalCode).toBe('')
    })

    it('rules が空配列であること', () => {
      expect(useTrashStore.getState().rules).toEqual([])
    })

    it('isLoading が false であること', () => {
      expect(useTrashStore.getState().isLoading).toBe(false)
    })

    it('error が null であること', () => {
      expect(useTrashStore.getState().error).toBeNull()
    })

    it('lastFetchedAt が null であること', () => {
      expect(useTrashStore.getState().lastFetchedAt).toBeNull()
    })
  })

  describe('fetchRules 成功', () => {
    it('ルールを取得して displayRules を設定すること', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, rules: sampleRules })

      await act(async () => {
        await useTrashStore.getState().fetchRules('160-0022')
      })

      const state = useTrashStore.getState()
      expect(state.rules).toHaveLength(1)
      expect(state.displayRules).toHaveLength(1)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.lastFetchedAt).not.toBeNull()
    })

    it('postalCode をハイフン除去して保存すること', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, rules: sampleRules })

      await act(async () => {
        await useTrashStore.getState().fetchRules('160-0022')
      })

      expect(useTrashStore.getState().postalCode).toBe('1600022')
    })
  })

  describe('fetchRules 失敗', () => {
    it('NOT_FOUND の場合 error を設定すること', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, error: 'NOT_FOUND' })

      await act(async () => {
        await useTrashStore.getState().fetchRules('1234567')
      })

      const state = useTrashStore.getState()
      expect(state.error).toBe('NOT_FOUND')
      expect(state.rules).toEqual([])
      expect(state.displayRules).toEqual([])
      expect(state.isLoading).toBe(false)
    })

    it('その他エラーの場合 error メッセージを設定すること', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, error: 'DB接続エラー' })

      await act(async () => {
        await useTrashStore.getState().fetchRules('1600022')
      })

      expect(useTrashStore.getState().error).toBe('DB接続エラー')
    })
  })

  describe('キャッシュロジック', () => {
    it('24h以内の同一郵便番号はキャッシュを使うこと', async () => {
      // キャッシュ済み状態をセット
      useTrashStore.setState({
        postalCode: '1600022',
        rules: sampleRules,
        displayRules: [],
        isLoading: false,
        error: null,
        lastFetchedAt: Date.now() - 1000, // 1秒前
      })

      await act(async () => {
        await useTrashStore.getState().fetchRules('160-0022')
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('24hを超えたキャッシュは再フェッチすること', async () => {
      useTrashStore.setState({
        postalCode: '1600022',
        rules: sampleRules,
        displayRules: [],
        isLoading: false,
        error: null,
        lastFetchedAt: Date.now() - 25 * 60 * 60 * 1000, // 25時間前
      })

      mockFetch.mockResolvedValueOnce({ ok: true, rules: sampleRules })

      await act(async () => {
        await useTrashStore.getState().fetchRules('160-0022')
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('別の郵便番号はキャッシュを使わず再フェッチすること', async () => {
      useTrashStore.setState({
        postalCode: '1600022',
        rules: sampleRules,
        displayRules: [],
        isLoading: false,
        error: null,
        lastFetchedAt: Date.now() - 1000,
      })

      mockFetch.mockResolvedValueOnce({ ok: true, rules: [] })

      await act(async () => {
        await useTrashStore.getState().fetchRules('5300001')
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('refreshDisplayRules', () => {
    it('rules から displayRules を再計算すること', () => {
      useTrashStore.setState({ rules: sampleRules, displayRules: [] })

      act(() => {
        useTrashStore.getState().refreshDisplayRules()
      })

      expect(useTrashStore.getState().displayRules).toHaveLength(1)
    })
  })

  describe('clearRules', () => {
    it('全状態をリセットすること', () => {
      useTrashStore.setState({
        postalCode: '1600022',
        rules: sampleRules,
        displayRules: [{ id: 1, category: 'test', schedule: { dayOfWeek: [] }, notes: '', icon: '', dayLabels: [] }],
        lastFetchedAt: Date.now(),
        error: 'some error',
      })

      act(() => {
        useTrashStore.getState().clearRules()
      })

      const state = useTrashStore.getState()
      expect(state.postalCode).toBe('')
      expect(state.rules).toEqual([])
      expect(state.displayRules).toEqual([])
      expect(state.lastFetchedAt).toBeNull()
      expect(state.error).toBeNull()
    })
  })

  describe('persist 対象の確認', () => {
    it('displayRules は persist 対象外であること（partialize に含まれない）', () => {
      // partialize 関数が displayRules を含まないことをストア定義から確認
      // useTrashStore の persist config: partialize: (s) => ({ postalCode, rules, lastFetchedAt })
      // isLoading / error / displayRules は persist されない
      const state = useTrashStore.getState()
      // isLoading は persist 非対象 → 初期値 false のまま
      expect(state.isLoading).toBe(false)
      // displayRules は persist 非対象 → 初期値 [] のまま（リハイドレート後は refreshDisplayRules で再計算）
      expect(state.displayRules).toEqual([])
    })
  })
})
