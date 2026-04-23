import { act } from 'react'
import { useTranslationStore } from '@/stores/useTranslationStore'

beforeEach(() => {
  useTranslationStore.setState({
    history: [],
    isLoading: false,
    error: null,
  })
})

describe('useTranslationStore', () => {
  describe('初期状態', () => {
    it('履歴が空であること', () => {
      const { history } = useTranslationStore.getState()
      expect(history).toEqual([])
    })

    it('ローディング状態がfalseであること', () => {
      const { isLoading } = useTranslationStore.getState()
      expect(isLoading).toBe(false)
    })

    it('エラーがnullであること', () => {
      const { error } = useTranslationStore.getState()
      expect(error).toBeNull()
    })
  })

  describe('翻訳履歴の管理', () => {
    it('翻訳結果を履歴に追加できること', () => {
      const { addHistory } = useTranslationStore.getState()
      act(() => {
        addHistory({ sourceText: 'こんにちは', translatedText: 'नमस्ते', direction: 'ja-ne' })
      })
      const { history } = useTranslationStore.getState()
      expect(history).toHaveLength(1)
      expect(history[0].sourceText).toBe('こんにちは')
      expect(history[0].translatedText).toBe('नमस्ते')
    })

    it('履歴をクリアできること', () => {
      const { addHistory, clearHistory } = useTranslationStore.getState()
      act(() => {
        addHistory({ sourceText: 'test', translatedText: 'test', direction: 'ja-ne' })
        clearHistory()
      })
      const { history } = useTranslationStore.getState()
      expect(history).toHaveLength(0)
    })

    it('履歴は最大20件を超えないこと', () => {
      const { addHistory } = useTranslationStore.getState()
      act(() => {
        for (let i = 0; i < 25; i++) {
          addHistory({ sourceText: `text-${i}`, translatedText: `trans-${i}`, direction: 'ja-ne' })
        }
      })
      const { history } = useTranslationStore.getState()
      expect(history).toHaveLength(20)
    })
  })

  describe('翻訳方向', () => {
    it('ja-ne（日本語→ネパール語）の方向を保持できること', () => {
      const { addHistory } = useTranslationStore.getState()
      act(() => {
        addHistory({ sourceText: 'ありがとう', translatedText: 'धन्यवाद', direction: 'ja-ne' })
      })
      const { history } = useTranslationStore.getState()
      expect(history[0].direction).toBe('ja-ne')
    })

    it('ne-ja（ネパール語→日本語）の方向を保持できること', () => {
      const { addHistory } = useTranslationStore.getState()
      act(() => {
        addHistory({ sourceText: 'धन्यवाद', translatedText: 'ありがとう', direction: 'ne-ja' })
      })
      const { history } = useTranslationStore.getState()
      expect(history[0].direction).toBe('ne-ja')
    })
  })

  describe('ローディング・エラー状態', () => {
    it('setLoadingでローディング状態を変更できること', () => {
      const { setLoading } = useTranslationStore.getState()
      act(() => { setLoading(true) })
      expect(useTranslationStore.getState().isLoading).toBe(true)
      act(() => { setLoading(false) })
      expect(useTranslationStore.getState().isLoading).toBe(false)
    })

    it('setErrorでエラーを設定できること', () => {
      const { setError } = useTranslationStore.getState()
      act(() => { setError('翻訳に失敗しました') })
      expect(useTranslationStore.getState().error).toBe('翻訳に失敗しました')
    })
  })
})
