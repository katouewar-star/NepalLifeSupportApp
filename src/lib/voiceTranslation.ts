import { Audio } from 'expo-av'
import { Platform } from 'react-native'

let _recording: Audio.Recording | null = null

export async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true // web: browser handles permission
  const { status } = await Audio.requestPermissionsAsync()
  return status === 'granted'
}

export async function startRecording(): Promise<void> {
  if (Platform.OS !== 'web') {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    })
  }
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  )
  _recording = recording
}

export async function stopRecording(): Promise<string | null> {
  if (!_recording) return null
  await _recording.stopAndUnloadAsync()
  const uri = _recording.getURI()
  _recording = null
  if (Platform.OS !== 'web') {
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
  }
  return uri ?? null
}

export async function transcribeAudio(uri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI APIキーが設定されていません')

  const formData = new FormData()
  formData.append('file', { uri, type: 'audio/m4a', name: 'recording.m4a' } as unknown as Blob)
  formData.append('model', 'whisper-1')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) throw new Error('音声認識に失敗しました')
  const data = await response.json()
  return data.text ?? ''
}
