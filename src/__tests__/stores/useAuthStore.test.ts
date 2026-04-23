import { act } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    session: null,
    isLoading: false,
    error: null,
    language: 'ne',
  })
})

describe('useAuthStore', () => {
  describe('初期状態', () => {
    it('ユーザーがnullであること', () => {
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('セッションがnullであること', () => {
      expect(useAuthStore.getState().session).toBeNull()
    })

    it('未認証状態であること', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('認証状態の管理', () => {
    it('setUserでユーザーを設定できること', () => {
      const { setUser } = useAuthStore.getState()
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'テストユーザー' }
      act(() => { setUser(mockUser) })
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('ユーザーが設定されると認証済み状態になること', () => {
      const { setUser } = useAuthStore.getState()
      act(() => {
        setUser({ id: 'user-1', email: 'test@example.com', name: 'テスト' })
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('signOutでユーザーとセッションがクリアされること', () => {
      const { setUser, signOut } = useAuthStore.getState()
      act(() => {
        setUser({ id: 'user-1', email: 'test@example.com', name: 'テスト' })
        signOut()
      })
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('言語設定', () => {
    it('デフォルト言語がneであること', () => {
      expect(useAuthStore.getState().language).toBe('ne')
    })

    it('setLanguageで言語を変更できること', () => {
      const { setLanguage } = useAuthStore.getState()
      act(() => { setLanguage('ja') })
      expect(useAuthStore.getState().language).toBe('ja')
    })
  })
})
