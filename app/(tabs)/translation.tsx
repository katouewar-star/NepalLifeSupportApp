import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTranslationStore } from '@/stores/useTranslationStore'
import type { TranslationDirection } from '@/stores/useTranslationStore'
import { translate, TRANSLATION_MAX_CHARS } from '@/lib/translation'
import {
  requestMicPermission,
  startRecording,
  stopRecording,
  transcribeAudio,
} from '@/lib/voiceTranslation'
import { pickImageAndExtract, takeCameraAndExtract } from '@/lib/scanTranslation'

const TRANSLATE_COOLDOWN_MS = 3000

export default function TranslationScreen() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [direction, setDirection] = useState<TranslationDirection>('ja-ne')
  const { isLoading, error, history, addHistory, setLoading, setError } =
    useTranslationStore()
  const lastTranslateAt = useRef<number>(0)
  const { t } = useTranslation()
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleVoice = async () => {
    if (isRecording) {
      setIsRecording(false)
      setIsProcessing(true)
      try {
        const uri = await stopRecording()
        if (uri) {
          const text = await transcribeAudio(uri)
          setInputText(text)
        }
      } catch {
        setError('音声認識に失敗しました')
      } finally {
        setIsProcessing(false)
      }
    } else {
      const granted = await requestMicPermission()
      if (!granted) { setError('マイクへのアクセスが許可されていません'); return }
      try {
        await startRecording()
        setIsRecording(true)
      } catch {
        setError('録音を開始できませんでした')
      }
    }
  }

  const handleScan = () => {
    Alert.alert(
      'スキャン翻訳 / स्क्यान अनुवाद',
      '画像の取得方法を選択 / छवि कसरी लिने?',
      [
        {
          text: '📷 カメラ',
          onPress: async () => {
            setIsProcessing(true)
            try {
              const text = await takeCameraAndExtract()
              if (text) setInputText(text)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'スキャンに失敗しました')
            } finally {
              setIsProcessing(false)
            }
          },
        },
        {
          text: '🖼️ ライブラリ',
          onPress: async () => {
            setIsProcessing(true)
            try {
              const text = await pickImageAndExtract()
              if (text) setInputText(text)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'スキャンに失敗しました')
            } finally {
              setIsProcessing(false)
            }
          },
        },
        { text: 'キャンセル', style: 'cancel' },
      ]
    )
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    const now = Date.now()
    if (now - lastTranslateAt.current < TRANSLATE_COOLDOWN_MS) {
      setError(t('translation.cooldownError'))
      return
    }
    lastTranslateAt.current = now
    setLoading(true)
    setError(null)
    setOutputText('')
    try {
      const result = await translate({ text: inputText, direction })
      if (result.error) {
        setError(result.error.message)
      } else if (result.translatedText) {
        setOutputText(result.translatedText)
        addHistory({ sourceText: inputText, translatedText: result.translatedText, direction })
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleDirection = () => {
    const prevInput = inputText
    const prevOutput = outputText
    setDirection((d) => (d === 'ja-ne' ? 'ne-ja' : 'ja-ne'))
    setInputText(prevOutput)
    setOutputText(prevInput)
  }

  const fromLabel = direction === 'ja-ne' ? t('translation.japanese') : t('translation.nepali')
  const toLabel   = direction === 'ja-ne' ? t('translation.nepali')  : t('translation.japanese')
  const charCount = inputText.length

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.translation')}</Text>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ── Language selector ── */}
        <View style={styles.langRow}>
          <View style={styles.langCard}>
            <Text style={styles.langFlag}>{direction === 'ja-ne' ? '🇯🇵' : '🇳🇵'}</Text>
            <Text style={styles.langName}>{fromLabel}</Text>
          </View>

          <TouchableOpacity onPress={toggleDirection} style={styles.swapBtn} activeOpacity={0.8}>
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>

          <View style={styles.langCard}>
            <Text style={styles.langFlag}>{direction === 'ja-ne' ? '🇳🇵' : '🇯🇵'}</Text>
            <Text style={styles.langName}>{toLabel}</Text>
          </View>
        </View>

        {/* ── Voice / Scan buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, isRecording && styles.actionBtnActive]}
            onPress={handleVoice}
            disabled={isProcessing}
          >
            {isProcessing && !isRecording ? (
              <ActivityIndicator size="small" color={RED} />
            ) : (
              <Text style={styles.actionIcon}>{isRecording ? '⏹' : '🎤'}</Text>
            )}
            <Text style={[styles.actionText, isRecording && styles.actionTextActive]}>
              {isRecording ? '停止' : '音声入力'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleScan}
            disabled={isProcessing || isRecording}
          >
            {isProcessing && !isRecording ? (
              <ActivityIndicator size="small" color={RED} />
            ) : (
              <Text style={styles.actionIcon}>📷</Text>
            )}
            <Text style={styles.actionText}>スキャン</Text>
          </TouchableOpacity>
        </View>

        {/* ── Input ── */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder={t('translation.inputPlaceholder', { lang: fromLabel })}
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={TRANSLATION_MAX_CHARS}
          />
          <Text style={[styles.charCount, charCount >= TRANSLATION_MAX_CHARS && styles.charCountLimit]}>
            {charCount} / {TRANSLATION_MAX_CHARS}
          </Text>
        </View>

        {/* ── Translate button ── */}
        <TouchableOpacity
          style={[styles.translateBtn, isLoading && styles.translateBtnDisabled]}
          onPress={handleTranslate}
          disabled={isLoading}
          testID="translate-button"
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.translateBtnText}>{t('translation.translateBtn')}</Text>
          )}
        </TouchableOpacity>

        {/* ── Error ── */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Output ── */}
        {outputText ? (
          <View style={styles.outputCard}>
            <View style={styles.outputLabelRow}>
              <Text style={styles.outputFlag}>{direction === 'ja-ne' ? '🇳🇵' : '🇯🇵'}</Text>
              <Text style={styles.outputLabel}>{toLabel}</Text>
            </View>
            <Text style={styles.outputText} selectable>{outputText}</Text>
          </View>
        ) : null}

        {/* ── History ── */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyLabel}>{t('translation.historyTitle')}</Text>
            {history.slice(0, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => {
                  setDirection(item.direction)
                  setInputText(item.sourceText)
                  setOutputText(item.translatedText)
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.historySource} numberOfLines={1}>{item.sourceText}</Text>
                <Text style={styles.historyArrow}>→</Text>
                <Text style={styles.historyTranslated} numberOfLines={1}>{item.translatedText}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  )
}

const RED = '#E63946'

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: RED,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  body: { flex: 1, padding: 16 },

  // ── Language selector ──
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  langCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  langFlag: { fontSize: 24, marginBottom: 4 },
  langName: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  swapBtn: {
    backgroundColor: RED,
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: { fontSize: 18, color: '#fff', fontWeight: 'bold' },

  // ── Input ──
  inputWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: '#1a1a2e',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 4 },
  charCountLimit: { color: RED },

  // ── Button ──
  translateBtn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  translateBtnDisabled: { backgroundColor: '#aaa' },
  translateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // ── Error ──
  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  errorText: { color: RED, fontSize: 14 },

  // ── Output ──
  outputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: RED,
  },
  outputLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  outputFlag: { fontSize: 16 },
  outputLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  outputText: { fontSize: 18, color: '#1a1a2e', lineHeight: 28 },

  // ── History ──
  historySection: { marginBottom: 8 },
  historyLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  historySource: { flex: 1, fontSize: 13, color: '#333' },
  historyArrow: { fontSize: 12, color: '#ccc' },
  historyTranslated: { flex: 1, fontSize: 13, color: RED, textAlign: 'right' },

  bottomPad: { height: 20 },

  // ── Action buttons (voice / scan) ──
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnActive: { backgroundColor: '#FDEDEE', borderColor: RED },
  actionIcon: { fontSize: 18 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#555' },
  actionTextActive: { color: RED },
})
