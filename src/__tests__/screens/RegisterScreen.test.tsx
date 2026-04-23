/**
 * 新規登録画面 コンポーネントテスト
 *
 * PASSWORD_MIN_LENGTH が 6 → 8 に変更されたため、プレースホルダーと
 * バリデーションメッセージのアサーションをそれに合わせて更新済み。
 * モックにも PASSWORD_MIN_LENGTH を含める（画面が import して使用するため）。
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import RegisterScreen from '@/screens/auth/RegisterScreen'

jest.mock('@/lib/auth', () => ({
  signUp: jest.fn(),
  PASSWORD_MIN_LENGTH: 8,
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
  Link: ({ children }: any) => children,
}))

import { signUp } from '@/lib/auth'
const mockSignUp = signUp as jest.MockedFunction<typeof signUp>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('RegisterScreen', () => {
  describe('レンダリング', () => {
    it('名前入力欄が表示されること', () => {
      const { getByPlaceholderText } = render(<RegisterScreen />)
      expect(getByPlaceholderText('名前')).toBeTruthy()
    })

    it('メールアドレス入力欄が表示されること', () => {
      const { getByPlaceholderText } = render(<RegisterScreen />)
      expect(getByPlaceholderText('メールアドレス')).toBeTruthy()
    })

    it('パスワード入力欄が表示されること', () => {
      const { getByPlaceholderText } = render(<RegisterScreen />)
      expect(getByPlaceholderText('パスワード（8文字以上）')).toBeTruthy()
    })

    it('登録ボタンが表示されること', () => {
      const { getByTestId } = render(<RegisterScreen />)
      expect(getByTestId('register-button')).toBeTruthy()
    })

    it('ログインリンクが表示されること', () => {
      const { getByText } = render(<RegisterScreen />)
      expect(getByText('ログインはこちら')).toBeTruthy()
    })
  })

  describe('バリデーション', () => {
    it('全フィールド空で登録するとエラーが表示されること', async () => {
      const { getByText, getByTestId } = render(<RegisterScreen />)
      fireEvent.press(getByTestId('register-button'))
      await waitFor(() => {
        expect(getByText('名前を入力してください')).toBeTruthy()
      })
    })

    it('パスワードが8文字未満の場合エラーが表示されること', async () => {
      const { getByPlaceholderText, getByText, getByTestId } = render(<RegisterScreen />)
      fireEvent.changeText(getByPlaceholderText('名前'), 'テスト')
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com')
      fireEvent.changeText(getByPlaceholderText('パスワード（8文字以上）'), '123')
      fireEvent.press(getByTestId('register-button'))
      await waitFor(() => {
        expect(getByText('パスワードは8文字以上で入力してください')).toBeTruthy()
      })
    })
  })

  describe('登録処理', () => {
    it('正常な入力で signUp が呼ばれること', async () => {
      mockSignUp.mockResolvedValueOnce({
        user: { id: 'user-1', email: 'test@example.com' },
        session: null,
        error: null,
      } as any)

      const { getByPlaceholderText, getByTestId } = render(<RegisterScreen />)
      fireEvent.changeText(getByPlaceholderText('名前'), 'テストユーザー')
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'test@example.com')
      fireEvent.changeText(getByPlaceholderText('パスワード（8文字以上）'), 'password123')
      fireEvent.press(getByTestId('register-button'))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          name: 'テストユーザー',
          language: 'ne',
        })
      })
    })

    it('登録失敗時にエラーメッセージが表示されること', async () => {
      // signUp は内部で Supabase エラーを正規化して返すため、
      // モックも実際の signUp が返す正規化済みメッセージを返す
      mockSignUp.mockResolvedValueOnce({
        user: null,
        session: null,
        error: { message: 'このメールアドレスは既に登録されています' },
      } as any)

      const { getByPlaceholderText, getByTestId, findByText } = render(<RegisterScreen />)
      fireEvent.changeText(getByPlaceholderText('名前'), 'テスト')
      fireEvent.changeText(getByPlaceholderText('メールアドレス'), 'existing@example.com')
      fireEvent.changeText(getByPlaceholderText('パスワード（8文字以上）'), 'password123')
      fireEvent.press(getByTestId('register-button'))

      expect(await findByText('このメールアドレスは既に登録されています')).toBeTruthy()
    })
  })
})
