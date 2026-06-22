import OpenAI from 'openai'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!apiKey) throw new Error('OpenAI APIキーが設定されていません')
    _client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  }
  return _client
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `あなたは在日ネパール人のためのAIアシスタント「ネパルくん」です。
日本での生活、仕事探し、住まい探し、日本語学習、行政手続き、文化の違いなどあらゆる相談に親切に答えます。
ユーザーがネパール語で書いた場合はネパール語で返答し、日本語で書いた場合は日本語で返答してください。
簡潔でわかりやすい回答を心がけてください。`

/**
 * Send a chat message. When `onChunk` is provided the response streams
 * token-by-token and each call receives the accumulated text so far,
 * enabling real-time display. Without `onChunk` a single awaited response
 * is returned (useful for testing / non-streaming contexts).
 */
export async function sendMessage(
  history: ChatMessage[],
  userMessage: string,
  onChunk?: (accumulatedText: string) => void
): Promise<string> {
  const client = getClient()
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  if (onChunk) {
    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
      stream: true,
    })

    let full = ''
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) {
        full += delta
        onChunk(full)
      }
    }
    return full || 'すみません、もう一度試してください。'
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 800,
    temperature: 0.7,
  })
  return response.choices[0]?.message?.content?.trim() ?? 'すみません、もう一度試してください。'
}
