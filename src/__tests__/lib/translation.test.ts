/**
 * 翻訳サービス ユニットテスト（OpenAI API をモック）
 *
 * translation.ts はモジュールスコープで OpenAI クライアントを _client にキャッシュするため、
 * テスト間で同じクライアントインスタンスが再利用される。
 * そのため mockCreate は top-level の jest.mock で一度だけ作成し、各テスト前に
 * mockReset() でリセットする。
 *
 * 前提：EXPO_PUBLIC_OPENAI_API_KEY が npm test スクリプト経由で設定されており、
 * Babel が translation.ts をコンパイルする際に有効な API キーとして認識する。
 */

const mockCreate = jest.fn()

jest.mock('openai', () => {
  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }))
  return { __esModule: true, default: MockOpenAI }
})

import { translate, buildTranslationPrompt } from '@/lib/translation'

beforeEach(() => {
  mockCreate.mockReset()
})

describe('翻訳サービス', () => {
  describe('translate（翻訳実行）', () => {
    it('日本語からネパール語に翻訳できること', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'नमस्ते' } }],
      })

      const result = await translate({ text: 'こんにちは', direction: 'ja-ne' })

      expect(result.translatedText).toBe('नमस्ते')
      expect(result.error).toBeNull()
    })

    it('ネパール語から日本語に翻訳できること', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'ありがとう' } }],
      })

      const result = await translate({ text: 'धन्यवाद', direction: 'ne-ja' })

      expect(result.translatedText).toBe('ありがとう')
      expect(result.error).toBeNull()
    })

    it('空テキストの場合エラーを返すこと', async () => {
      const result = await translate({ text: '', direction: 'ja-ne' })

      expect(result.translatedText).toBeNull()
      expect(result.error?.message).toContain('テキストを入力')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('空白のみのテキストの場合エラーを返すこと', async () => {
      const result = await translate({ text: '   ', direction: 'ja-ne' })

      expect(result.translatedText).toBeNull()
      expect(result.error?.message).toContain('テキストを入力')
    })

    it('API エラー時にエラーを返すこと', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API connection failed'))

      const result = await translate({ text: 'こんにちは', direction: 'ja-ne' })

      expect(result.translatedText).toBeNull()
      expect(result.error).not.toBeNull()
    })

    it('レスポンスが空の場合エラーを返すこと', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '' } }],
      })

      const result = await translate({ text: 'こんにちは', direction: 'ja-ne' })

      expect(result.error?.message).toContain('翻訳結果')
    })

    it('gpt-4o-mini モデルを使用すること', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'नमस्ते' } }],
      })

      await translate({ text: 'こんにちは', direction: 'ja-ne' })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gpt-4o-mini' })
      )
    })
  })

  describe('buildTranslationPrompt（プロンプト生成）', () => {
    it('ja-ne 方向のプロンプトに「ネパール語」が含まれること', () => {
      const prompt = buildTranslationPrompt('こんにちは', 'ja-ne')
      expect(prompt.system).toContain('ネパール語')
      expect(prompt.user).toContain('こんにちは')
    })

    it('ne-ja 方向のプロンプトに「日本語」が含まれること', () => {
      const prompt = buildTranslationPrompt('धन्यवाद', 'ne-ja')
      expect(prompt.system).toContain('日本語')
      expect(prompt.user).toContain('धन्यवाद')
    })

    it('翻訳のみ返すよう指示が含まれること', () => {
      const prompt = buildTranslationPrompt('test', 'ja-ne')
      expect(prompt.system).toContain('翻訳結果のみ')
    })
  })
})
