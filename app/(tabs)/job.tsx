import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { JOB_AGENCIES, filterAgencies, AgencyCategory } from '../../src/lib/job'

type FilterValue = 'all' | AgencyCategory

export default function JobScreen() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterValue>('all')

  const agencies = filterAgencies(JOB_AGENCIES, filter)

  const filters: { key: FilterValue; label: string }[] = [
    { key: 'all', label: t('job.filterAll') },
    { key: 'public', label: t('job.filterPublic') },
    { key: 'private', label: t('job.filterPrivate') },
  ]

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('job.title')}</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterText, filter === f.key && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {agencies.length === 0 ? (
          <Text style={styles.noResults}>{t('job.noResults')}</Text>
        ) : (
          agencies.map((agency) => {
            const isPublic = agency.category === 'public'
            return (
            <View key={agency.id} style={styles.card}>
              {/* Card header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>
                  {isPublic ? '🏛️' : '🏢'}
                </Text>
                <View style={styles.cardTitleArea}>
                  <Text style={styles.cardName}>
                    {t(`job.agencies.${agency.id}.name`)}
                  </Text>
                  <View style={styles.badges}>
                    <View
                      style={[
                        styles.badge,
                        isPublic ? styles.badgePublic : styles.badgePrivate,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {isPublic ? t('job.filterPublic') : t('job.filterPrivate')}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        agency.isVerified ? styles.badgeVerified : styles.badgePending,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {agency.isVerified
                          ? `✅ ${t('job.verified')}`
                          : `⏳ ${t('job.pending')}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Verified date */}
              <Text style={styles.meta}>
                {t('job.verifiedAt')}: {agency.verifiedAt}
              </Text>

              {/* Visa types */}
              <Text style={styles.meta}>
                {t('job.visaLabel')}: {agency.visaTypes.join('・')}
              </Text>

              {/* Languages */}
              <Text style={styles.meta}>
                {t('job.langLabel')}: {agency.languages.join('・')}
              </Text>

              {/* Hours */}
              {agency.hours && (
                <Text style={styles.meta}>
                  {t('job.hoursLabel')}: {agency.hours}
                </Text>
              )}

              {/* Tel */}
              {agency.tel && (
                <Text style={styles.meta}>
                  {t('job.telLabel')}: {agency.tel}
                </Text>
              )}

              {/* Note */}
              <Text style={styles.note}>{t(`job.agencies.${agency.id}.note`)}</Text>

              {/* URL button */}
              <TouchableOpacity
                style={[styles.urlBtn, !agency.isVerified && styles.urlBtnDisabled]}
                onPress={() => {
                  if (agency.isVerified) {
                    Linking.openURL(agency.url)
                  }
                }}
                disabled={!agency.isVerified}
              >
                <Text style={styles.urlBtnText}>{t('job.openUrl')}</Text>
              </TouchableOpacity>
            </View>
            )
          })
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>⚠ {t('job.disclaimer')}</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const RED = '#c0392b'
const LIGHT_RED = '#fdecea'

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: RED,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: RED, borderColor: RED },
  filterText: { fontSize: 13, color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  list: { padding: 16, gap: 12 },
  noResults: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardIcon: { fontSize: 28, marginRight: 10 },
  cardTitleArea: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgePublic: { backgroundColor: '#e8f4fd' },
  badgePrivate: { backgroundColor: '#fef9e7' },
  badgeVerified: { backgroundColor: '#eafaf1' },
  badgePending: { backgroundColor: '#fef5e4' },
  badgeText: { fontSize: 11, color: '#333' },

  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  note: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    backgroundColor: '#fafafa',
    padding: 8,
    borderRadius: 6,
  },

  urlBtn: {
    marginTop: 12,
    backgroundColor: RED,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  urlBtnDisabled: { backgroundColor: '#ccc' },
  urlBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  disclaimer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: LIGHT_RED,
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 12, color: '#7b241c', lineHeight: 18 },
})
