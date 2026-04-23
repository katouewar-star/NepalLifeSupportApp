import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTranslationStore } from '@/stores/useTranslationStore'
import type { TranslationDirection } from '@/stores/useTranslationStore'
import { translate, TRANSLATION_MAX_CHARS } from '@/lib/translation'

const TRANSLATE_COOLDOWN_MS = 3000

export default function TranslationScreen() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [direction, setDirection] = useState<TranslationDirection>('ja-ne')
  const { isLoading, error, history, addHistory, setLoading, setError } =
    useTranslationStore()
  const lastTranslateAt = useRef<number>(0)
  const { t } = useTranslation()

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
  const toLabel = direction === 'ja-ne' ? t('translation.nepali') : t('translation.japanese')
  const charCount = inputText.length

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* 方向切替 */}
      <View style={styles.directionRow}>
        <Text style={styles.langLabel}>{fromLabel}</Text>
        <TouchableOpacity onPress={toggleDirection} style={styles.swapBtn}>
          <Text style={styles.swapIcon}>⇄</Text>
        </TouchableOpacity>
        <Text style={styles.langLabel}>{toLabel}</Text>
      </View>

      {/* 入力 */}
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

      {/* 翻訳ボタン */}
      <TouchableOpacity
        style={[styles.translateBtn, isLoading && styles.translateBtnDisabled]}
        onPress={handleTranslate}
        disabled={isLoading}
        testID="translate-button"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.translateBtnText}>{t('translation.translateBtn')}</Text>
        )}
      </TouchableOpacity>

      {/* エラー */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* 結果 */}
      {outputText ? (
        <View style={styles.outputBox}>
          <Text style={styles.outputLabel}>{toLabel}</Text>
          <Text style={styles.outputText} selectable>
            {outputText}
          </Text>
        </View>
      ) : null}

      {/* 履歴（最新5件） */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>{t('translation.historyTitle')}</Text>
          {history.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => {
                setDirection(item.direction)
                setInputText(item.sourceText)
                setOutputText(item.translatedText)
              }}
            >
              <Text style={styles.historySource} numberOfLines={1}>
                {item.sourceText}
              </Text>
              <Text style={styles.historyArrow}>→</Text>
              <Text style={styles.historyTranslated} numberOfLines={1}>
                {item.translatedText}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  langLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', flex: 1, textAlign: 'center' },
  swapBtn: {
    backgroundColor: '#E63946',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  charCount: { fontSize: 11, color: '#aaa', textAlign: 'right', marginBottom: 8 },
  charCountLimit: { color: '#E63946' },
  translateBtn: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  translateBtnDisabled: { backgroundColor: '#aaa' },
  translateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#E63946', fontSize: 14, marginBottom: 8 },
  outputBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E63946',
  },
  outputLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  outputText: { fontSize: 18, color: '#1a1a2e', lineHeight: 28 },
  historySection: { marginTop: 8 },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 6,
    gap: 6,
  },
  historySource: { flex: 1, fontSize: 13, color: '#333' },
  historyArrow: { fontSize: 12, color: '#aaa' },
  historyTranslated: { flex: 1, fontSize: 13, color: '#E63946' },
})
