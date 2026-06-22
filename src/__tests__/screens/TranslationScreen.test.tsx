/**
 * 翻訳画面 UIテスト
 */

jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
          getURI: jest.fn().mockReturnValue(null),
        },
      }),
    },
    RecordingOptionsPresets: { HIGH_QUALITY: {} },
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        'translation.japanese': '日本語',
        'translation.nepali': 'ネパール語',
        'translation.translateBtn': '翻訳する',
        'translation.historyTitle': '履歴',
        'tabs.translation': '翻訳',
        'translation.cooldownError': '少し待ってから再度翻訳してください',
      }
      if (key === 'translation.inputPlaceholder' && params?.lang) {
        return `${params.lang}を入力...`
      }
      return map[key] ?? key
    },
    i18n: { changeLanguage: jest.fn() },
  }),
}))

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
