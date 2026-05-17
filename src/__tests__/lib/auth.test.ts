/**
 * 認証サービス ユニットテスト（Supabase をモック）
 */

// Supabase クライアントをモック
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'
import { signUp, signIn, signOut, getCurrentSession } from '@/lib/auth'

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('認証サービス', () => {
  describe('signUp（新規登録）', () => {
    it('正常に登録できること', async () => {
      mockAuth.signUp.mockResolvedValueOnce({
        data: {
          user: { id: 'user-1', email: 'test@example.com' },
          session: { access_token: 'token', refresh_token: 'refresh' },
        },
        error: null,
      } as any)

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'テストユーザー',
        language: 'ne',
      })

      expect(result.error).toBeNull()
      expect(result.user?.email).toBe('test@example.com')
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { name: 'テストユーザー', language: 'ne' },
          emailRedirectTo: 'https://nepal-life-support-app.vercel.app/confirm',
        },
      })
    })

    it('メール確認が必要な場合 needsEmailConfirmation が true になること', async () => {
      mockAuth.signUp.mockResolvedValueOnce({
        data: {
          user: { id: 'user-1', email: 'test@example.com' },
          session: null, // セッションなし = メール確認待ち
        },
        error: null,
      } as any)

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'テストユーザー',
        language: 'ne',
      })

      expect(result.error).toBeNull()
      expect(result.needsEmailConfirmation).toBe(true)
      expect(result.session).toBeNull()
    })

    it('メールアドレスが既に使用中の場合エラーを返すこと', async () => {
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 422 },
      } as any)

      const result = await signUp({
        email: 'existing@example.com',
        password: 'password123',
        name: 'テスト',
        language: 'ne',
      })

      expect(result.error).not.toBeNull()
      expect(result.user).toBeNull()
    })

    it('パスワードが6文字未満の場合エラーを返すこと', async () => {
      const result = await signUp({
        email: 'test@example.com',
        password: '123',
        name: 'テスト',
        language: 'ne',
      })

      expect(result.error?.message).toContain('パスワード')
      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })

    it('メールアドレスが不正な場合エラーを返すこと', async () => {
      const result = await signUp({
        email: 'invalid-email',
        password: 'password123',
        name: 'テスト',
        language: 'ne',
      })

      expect(result.error?.message).toContain('メールアドレス')
      expect(mockAuth.signUp).not.toHaveBeenCalled()
    })
  })

  describe('signIn（ログイン）', () => {
    it('正常にログインできること', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'user-1', email: 'test@example.com' },
          session: { access_token: 'token', refresh_token: 'refresh' },
        },
        error: null,
      } as any)

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error).toBeNull()
      expect(result.session?.accessToken).toBe('token')
    })

    it('認証情報が間違っている場合エラーを返すこと', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      } as any)

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.error).not.toBeNull()
      expect(result.session).toBeNull()
    })
  })

  describe('signOut（ログアウト）', () => {
    it('正常にログアウトできること', async () => {
      mockAuth.signOut.mockResolvedValueOnce({ error: null } as any)

      const result = await signOut()

      expect(result.error).toBeNull()
      expect(mockAuth.signOut).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCurrentSession（セッション取得）', () => {
    it('有効なセッションを返すこと', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: {
          session: { access_token: 'token', refresh_token: 'refresh' },
        },
        error: null,
      } as any)

      const result = await getCurrentSession()

      expect(result.session?.accessToken).toBe('token')
    })

    it('セッションがない場合 null を返すこと', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any)

      const result = await getCurrentSession()

      expect(result.session).toBeNull()
    })
  })
})
