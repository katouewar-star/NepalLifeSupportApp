/**
 * ログイン画面 コンポーネントテスト
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import LoginScreen from '@/screens/auth/LoginScreen'

// react-i18next をモック（翻訳キー→日本語文字列）
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'auth.login.emailPlaceholder': 'メールアドレス',
        'auth.login.passwordPlaceholder': 'パスワード',
        'auth.login.footerLink': '新規登録',
        'auth.login.errorEmail': 'メールアドレスを入力してください',
        'auth.login.errorPassword': 'パスワードを入力してください',
      }
      return map[key] ?? key
    },
    i18n: { changeLanguage: jest.fn() },
  }),
}))

// 認証サービスをモック
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
}))

// Expo Router をモック
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  Link: ({ children }: any) => children,
}))

import { signIn } from '@/lib/auth'
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('LoginScreen', () => {
  describe('レンダリング', () => {
    it('メールアドレス入力欄が表示されること', () => {
      const { getByPlaceholderText } = render(<LoginScreen />)
      expect(getByPlaceholderText('メールアドレス')).toBeTruthy()
    })

    it('パスワード入力欄が表示されること', () => {
      const { getByPlaceholderText } = render(<LoginScreen />)
      expect(getByPlaceholderText('パスワード')).toBeTruthy()
    })

    it('ログインボタンが表示されること', () => {
      const { getByTestId } = render(<LoginScreen />)
      expect(getByTestId('login-button')).toBeTruthy()
    })

    it('新規登録リンクが表示されること', () => {
      const { getByText } = render(<LoginScreen />)
      expect(getByText('新規登録')).toBeTruthy()
    })
  })

  describe('バリデーション', () => {
    it('空のままログインボタンを押すとエラーが表示されること', async () => {
      const { getByText, getByTestId } = render(<LoginScreen />)
      fireEvent.press(getByTestId('login-button'))
      await waitFor(() => {
        expect(getByText('メールアドレスを入力してください')).toBeTruthy()
      })
    })

    it('メールアドレスのみ入力してログインするとパスワードエラーが表示されること', async () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(<LoginScreen />)
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com')
      fireEvent.press(getByTestId('login-button'))
      await waitFor(() => {
        expect(getByText('パスワードを入力してください')).toBeTruthy()
      })
    })
  })

  describe('ログイン処理', () => {
    it('正常なログインでホーム画面に遷移すること', async () => {
      mockSignIn.mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { access_token: 'token', refresh_token: 'refresh' },
        error: null,
      } as any)

      const { getByPlaceholderText, getByTestId } = render(<LoginScreen />)
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com')
      fireEvent.changeText(getByPlaceholderText('パスワード'), 'password123')
      fireEvent.press(getByTestId('login-button'))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('ログイン失敗時にエラーメッセージが表示されること', async () => {
      // signIn は内部で Supabase エラーを正規化して返すため（アカウント列挙防止）、
      // モックも実際の signIn が返す正規化済みメッセージを返す
      mockSignIn.mockResolvedValueOnce({
        user: null,
        session: null,
        error: { message: 'メールアドレスまたはパスワードが正しくありません' },
      } as any)

      const { getByPlaceholderText, getByTestId, findByText } = render(<LoginScreen />)
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com')
      fireEvent.changeText(getByPlaceholderText('パスワード'), 'wrongpassword')
      fireEvent.press(getByTestId('login-button'))

      expect(await findByText('メールアドレスまたはパスワードが正しくありません')).toBeTruthy()
    })

    it('ログイン中はローディング表示されること', async () => {
      mockSignIn.mockImplementation(() => new Promise(() => {})) // 永遠にpending

      const { getByPlaceholderText, getByText, getByTestId } = render(<LoginScreen />)
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com')
      fireEvent.changeText(getByPlaceholderText('パスワード'), 'password123')
      fireEvent.press(getByTestId('login-button'))

      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy()
      })
    })
  })
})
