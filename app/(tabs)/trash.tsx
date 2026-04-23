import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTrashStore } from '@/stores/useTrashStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatWeekOfMonth } from '@/lib/trash'
import type { TrashRuleDisplay } from '@/lib/trash'

const formatPostalCode = (text: string) => {
  const d = text.replace(/\D/g, '').slice(0, 7)
  return d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d
}

function TrashRuleCard({
  item,
  language,
}: {
  item: TrashRuleDisplay
  language: 'ja' | 'ne'
}) {
  const { t } = useTranslation()
  const weekLabel = formatWeekOfMonth(item.schedule.weekOfMonth, language)
  const timeLabel = item.schedule.time
    ? `${item.schedule.time}${t('trash.until')}`
    : ''

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>

      <View style={styles.badgeRow}>
        {item.dayLabels.map((day) => (
          <View key={day} style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{day}</Text>
          </View>
        ))}
      </View>

      {weekLabel ? (
        <Text style={styles.weekLabel}>
          {weekLabel}
        </Text>
      ) : null}

      {timeLabel ? (
        <Text style={styles.timeLabel}>{timeLabel}</Text>
      ) : null}

      <Text style={styles.cardNotes}>{item.notes}</Text>
    </View>
  )
}

export default function TrashScreen() {
  const [input, setInput] = useState('')
  const { displayRules, isLoading, error, fetchRules } = useTrashStore()
  const language = useAuthStore((s) => s.language)
  const { t } = useTranslation()

  const digits = input.replace(/\D/g, '')
  const isReady = digits.length === 7

  const handleSearch = () => {
    if (!isReady) return
    fetchRules(input)
  }

  const handleRetry = () => {
    if (digits.length > 0) fetchRules(input)
  }

  const isNotFound = error === 'NOT_FOUND'

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('trash.title')}</Text>

      {/* 郵便番号入力 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t('trash.placeholder')}
          value={input}
          onChangeText={(text) => setInput(formatPostalCode(text))}
          keyboardType="numeric"
          maxLength={8}
          testID="postal-input"
        />
        <TouchableOpacity
          style={[styles.searchBtn, !isReady && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!isReady || isLoading}
          testID="search-button"
        >
          <Text style={styles.searchBtnText}>{t('trash.searchBtn')}</Text>
        </TouchableOpacity>
      </View>

      {/* ローディング */}
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#E63946"
          style={styles.loader}
          testID="loading-indicator"
        />
      )}

      {/* エラー */}
      {error && !isLoading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {isNotFound ? t('trash.notFound') : error}
          </Text>
          {!isNotFound && (
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} testID="retry-button">
              <Text style={styles.retryBtnText}>{t('trash.retry')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ルールカード */}
      {!isLoading && !error && displayRules.length > 0 && (
        <View style={styles.cardList}>
          {displayRules.map((item) => (
            <TrashRuleCard key={item.id} item={item} language={language} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 16 },

  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1a1a2e',
  },
  searchBtn: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnDisabled: { backgroundColor: '#aaa' },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  loader: { marginVertical: 32 },

  errorBox: { alignItems: 'center', marginVertical: 24, gap: 12 },
  errorText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    backgroundColor: '#E63946',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  cardList: { gap: 12 },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E63946',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardIcon: { fontSize: 32 },
  cardCategory: { fontSize: 17, fontWeight: 'bold', color: '#1a1a2e', flex: 1 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  dayBadge: {
    backgroundColor: '#E63946',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dayBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  weekLabel: { fontSize: 13, color: '#555', marginBottom: 4 },
  timeLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  cardNotes: { fontSize: 14, color: '#333', lineHeight: 20 },
})
