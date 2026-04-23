/**
 * 翻訳画面 UIテスト
 */

jest.mock('@/lib/translation', () => ({
  translate: jest.fn(),
}))

jest.mock('@/stores/useTranslationStore', () => {
  const actual = jest.requireActual('@/stores/useTranslationStore')
  return actual
})

import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native'
import TranslationScreen from '../../../app/(tabs)/translation'
import { translate } from '@/lib/translation'

const mockTranslate = translate as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  // Reset Zustand store
  const { useTranslationStore } = require('@/stores/useTranslationStore')
  useTranslationStore.setState({ history: [], isLoading: false, error: null })
})

describe('翻訳画面', () => {
  it('初期表示：日本語→ネパール語の方向が表示されること', () => {
    render(<TranslationScreen />)
    expect(screen.getByText('日本語')).toBeTruthy()
    expect(screen.getByText('ネパール語')).toBeTruthy()
  })

  it('翻訳ボタンが表示されること', () => {
    render(<TranslationScreen />)
    expect(screen.getByTestId('translate-button')).toBeTruthy()
  })

  it('翻訳成功時に結果が表示されること', async () => {
    mockTranslate.mockResolvedValueOnce({ translatedText: 'नमस्ते', error: null })
    render(<TranslationScreen />)

    fireEvent.changeText(screen.getByPlaceholderText('日本語を入力...'), 'こんにちは')
    fireEvent.press(screen.getByTestId('translate-button'))

    await waitFor(() => {
      expect(screen.getAllByText('नमस्ते').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('API エラー時にエラーメッセージが表示されること', async () => {
    mockTranslate.mockResolvedValueOnce({
      translatedText: null,
      error: { message: '翻訳に失敗しました' },
    })
    render(<TranslationScreen />)

    fireEvent.changeText(screen.getByPlaceholderText('日本語を入力...'), 'こんにちは')
    fireEvent.press(screen.getByTestId('translate-button'))

    await waitFor(() => {
      expect(screen.getByText('翻訳に失敗しました')).toBeTruthy()
    })
  })

  it('⇄ボタンで翻訳方向が切り替わること', () => {
    render(<TranslationScreen />)

    fireEvent.press(screen.getByText('⇄'))

    expect(screen.getByText('ネパール語')).toBeTruthy()
    expect(screen.getByText('日本語')).toBeTruthy()
    expect(screen.getByPlaceholderText('ネパール語を入力...')).toBeTruthy()
  })

  it('空テキストのまま翻訳ボタンを押しても translate が呼ばれないこと', async () => {
    render(<TranslationScreen />)
    fireEvent.press(screen.getByTestId('translate-button'))
    await waitFor(() => {
      expect(mockTranslate).not.toHaveBeenCalled()
    })
  })
})
