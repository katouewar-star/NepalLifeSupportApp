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
  const timeLabel = item.schedule.time ? `${item.schedule.time}${t('trash.until')}` : ''

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>

      <View style={styles.badgeRow}>
        {item.dayLabels.map((day) => (
          <View key={day} style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{day}</Text>
          </View>
        ))}
      </View>

      {weekLabel ? <Text style={styles.weekLabel}>{weekLabel}</Text> : null}
      {timeLabel ? <Text style={styles.timeLabel}>{timeLabel}</Text> : null}

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
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('trash.title')}</Text>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchSection}>
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
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Loading */}
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={GREEN}
            style={styles.loader}
            testID="loading-indicator"
          />
        )}

        {/* Error */}
        {error && !isLoading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>😔</Text>
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

        {/* Rule cards */}
        {!isLoading && !error && displayRules.length > 0 && (
          <View style={styles.cardList}>
            {displayRules.map((item) => (
              <TrashRuleCard key={item.id} item={item} language={language} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !error && displayRules.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗑️</Text>
            <Text style={styles.emptyText}>郵便番号で検索してください</Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  )
}

const GREEN = '#27AE60'

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: GREEN,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a2e',
    backgroundColor: '#fafafa',
  },
  searchBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnDisabled: { backgroundColor: '#ccc' },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  body: { flex: 1, padding: 16 },
  loader: { marginVertical: 40 },

  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  errorIcon: { fontSize: 36 },
  errorText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 14, color: '#aaa' },

  cardList: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: GREEN + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardCategory: { fontSize: 17, fontWeight: 'bold', color: '#1a1a2e', flex: 1 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  dayBadge: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  weekLabel: { fontSize: 13, color: '#555', marginBottom: 4 },
  timeLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  cardNotes: { fontSize: 14, color: '#333', lineHeight: 20 },

  bottomPad: { height: 20 },
})
