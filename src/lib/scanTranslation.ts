import * as ImagePicker from 'expo-image-picker'
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

async function extractTextFromBase64(base64: string): Promise<string> {
  const client = getClient()
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64}` },
          },
          {
            type: 'text',
            text: 'この画像に含まれているテキストをすべて抽出してください。テキストのみを返し、説明は不要です。',
          },
        ],
      },
    ],
    max_tokens: 1000,
  })
  return response.choices[0]?.message?.content?.trim() ?? ''
}

export async function pickImageAndExtract(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') throw new Error('写真へのアクセスが許可されていません')

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    quality: 0.8,
  })

  if (result.canceled || !result.assets[0]?.base64) return null
  return extractTextFromBase64(result.assets[0].base64)
}

export async function takeCameraAndExtract(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  if (status !== 'granted') throw new Error('カメラへのアクセスが許可されていません')

  const result = await ImagePicker.launchCameraAsync({
    base64: true,
    quality: 0.8,
  })

  if (result.canceled || !result.assets[0]?.base64) return null
  return extractTextFromBase64(result.assets[0].base64)
}
