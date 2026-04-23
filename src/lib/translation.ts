/**
 * 翻訳サービス
 * OpenAI gpt-4o-mini を使ってネパール語 ⇔ 日本語翻訳を提供
 *
 * NOTE: MVP では OPENAI_API_KEY を直接使用
 * 本番前に Supabase Edge Function プロキシ経由に移行すること
 */

import OpenAI from 'openai'
import type { TranslationDirection } from '@/stores/useTranslationStore'

export const TRANSLATION_MAX_CHARS = 2000

interface TranslationResult {
  translatedText: string | null
  error: { message: string } | null
}

interface TranslationParams {
  text: string
  direction: TranslationDirection
}

interface TranslationPrompt {
  system: string
  user: string
}

// クライアントは一度だけ生成して再利用
let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI APIキーが設定されていません')
    }
    // React Native 環境では dangerouslyAllowBrowser が必要
    _client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  }
  return _client
}

export function buildTranslationPrompt(text: string, direction: TranslationDirection): TranslationPrompt {
  const isJaToNe = direction === 'ja-ne'

  const system = isJaToNe
    ? `あなたはプロの翻訳者です。日本語をネパール語（デーヴァナーガリー文字）に翻訳してください。
在日ネパール人が日本の生活で使う表現（行政・医療・生活・職場）を意識した、自然なネパール語に翻訳してください。
翻訳結果のみを返してください。説明や注釈は不要です。`
    : `あなたはプロの翻訳者です。ネパール語を日本語に翻訳してください。
自然で分かりやすい日本語に翻訳してください。
翻訳結果のみを返してください。説明や注釈は不要です。`

  return { system, user: text }
}

export async function translate({ text, direction }: TranslationParams): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: null, error: { message: 'テキストを入力してください' } }
  }
  if (text.length > TRANSLATION_MAX_CHARS) {
    return { translatedText: null, error: { message: `${TRANSLATION_MAX_CHARS}文字以内で入力してください` } }
  }

  try {
    const client = getClient()
    const { system, user } = buildTranslationPrompt(text, direction)

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const translated = response.choices[0]?.message?.content?.trim()

    if (!translated) {
      return { translatedText: null, error: { message: '翻訳結果が取得できませんでした' } }
    }

    return { translatedText: translated, error: null }
  } catch (e) {
    const rawMessage = e instanceof Error ? e.message : ''
    const message = resolveErrorMessage(rawMessage)
    return { translatedText: null, error: { message } }
  }
}

function resolveErrorMessage(raw: string): string {
  if (!raw) return '翻訳に失敗しました'
  const lower = raw.toLowerCase()
  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('connect') ||
    lower.includes('enotfound') ||
    lower.includes('timeout')
  ) {
    return 'インターネット接続を確認してください'
  }
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('api key')) {
    return 'APIキーが正しくありません'
  }
  if (lower.includes('429') || lower.includes('rate limit')) {
    return 'リクエストが多すぎます。しばらくお待ちください'
  }
  if (lower.includes('500') || lower.includes('502') || lower.includes('503')) {
    return 'サーバーエラーが発生しました。しばらくお待ちください'
  }
  return '翻訳に失敗しました'
}
