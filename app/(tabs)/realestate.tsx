import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  REAL_ESTATE_AGENTS,
  filterAgents,
  RealEstateCategory,
} from '../../src/lib/realestate'

const { width: SCREEN_W } = Dimensions.get('window')
type FilterValue = 'all' | RealEstateCategory

function categoryIcon(cat: RealEstateCategory): string {
  switch (cat) {
    case 'portal':    return '🔍'
    case 'agency':    return '🏢'
    case 'guarantee': return '🛡️'
  }
}

function categoryColor(cat: RealEstateCategory): string {
  switch (cat) {
    case 'portal':    return '#16A085'
    case 'agency':    return '#1A5276'
    case 'guarantee': return '#6C3483'
  }
}

function filterKey(cat: RealEstateCategory): string {
  const map: Record<RealEstateCategory, string> = {
    portal:    'realestate.filterPortal',
    agency:    'realestate.filterAgency',
    guarantee: 'realestate.filterGuarantee',
  }
  return map[cat]
}

export default function RealEstateScreen() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [heroIndex, setHeroIndex] = useState(0)

  const filtered = filterAgents(REAL_ESTATE_AGENTS, filter)

  const filters: { key: FilterValue; label: string }[] = [
    { key: 'all',       label: t('realestate.filterAll') },
    { key: 'portal',    label: t('realestate.filterPortal') },
    { key: 'agency',    label: t('realestate.filterAgency') },
    { key: 'guarantee', label: t('realestate.filterGuarantee') },
  ]

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('realestate.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Featured hero cards ── */}
        <View style={styles.featuredSection}>
          <Text style={styles.featuredLabel}>{t('realestate.featuredTitle')}</Text>

          <FlatList
            data={REAL_ESTATE_AGENTS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W)
              setHeroIndex(idx)
            }}
            renderItem={({ item }) => {
              const color = categoryColor(item.category)
              return (
                <View style={[styles.heroCard, { backgroundColor: color }]}>
                  <Text style={styles.heroIcon}>{categoryIcon(item.category)}</Text>
                  <Text style={styles.heroName}>
                    {t(`realestate.agents.${item.id}.name`)}
                  </Text>
                  <Text style={styles.heroLocation}>📍 {item.location}</Text>
                  <Text style={styles.heroNote}>
                    {t(`realestate.agents.${item.id}.note`)}
                  </Text>
                  <TouchableOpacity
                    style={styles.heroBtn}
                    onPress={() => Linking.openURL(item.url)}
                  >
                    <Text style={styles.heroBtnText}>{t('realestate.openUrl')}</Text>
                  </TouchableOpacity>
                </View>
              )
            }}
          />

          {/* Pagination dots */}
          <View style={styles.dots}>
            {REAL_ESTATE_AGENTS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === heroIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* ── Filter pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
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
        </ScrollView>

        {/* ── Agent cards ── */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <Text style={styles.noResults}>{t('realestate.noResults')}</Text>
          ) : (
            filtered.map((agent) => {
              const color = categoryColor(agent.category)
              return (
                <View key={agent.id} style={styles.card}>
                  {/* Card header */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconBox, { backgroundColor: color + '22' }]}>
                      <Text style={styles.cardIcon}>{categoryIcon(agent.category)}</Text>
                    </View>
                    <View style={styles.cardTitleArea}>
                      <Text style={styles.cardName}>
                        {t(`realestate.agents.${agent.id}.name`)}
                      </Text>
                      <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                          <Text style={[styles.badgeText, { color }]}>
                            {t(filterKey(agent.category))}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            agent.isVerified ? styles.badgeVerified : styles.badgePending,
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {agent.isVerified
                              ? `✅ ${t('realestate.verified')}`
                              : `⏳ ${t('realestate.pending')}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Meta */}
                  <Text style={styles.meta}>📍 {agent.location}</Text>
                  {agent.nepalLang && (
                    <Text style={styles.metaTeal}>
                      🇳🇵 {t('realestate.nepalLang')}
                    </Text>
                  )}
                  {agent.guarantorFree && (
                    <Text style={styles.metaTeal}>
                      ✅ {t('realestate.guarantorFree')}
                    </Text>
                  )}

                  {/* Note */}
                  <Text style={styles.note}>
                    {t(`realestate.agents.${agent.id}.note`)}
                  </Text>

                  {/* URL button */}
                  <TouchableOpacity
                    style={[
                      styles.urlBtn,
                      { backgroundColor: color },
                      !agent.isVerified && styles.urlBtnDisabled,
                    ]}
                    onPress={() => {
                      if (agent.isVerified) Linking.openURL(agent.url)
                    }}
                    disabled={!agent.isVerified}
                  >
                    <Text style={styles.urlBtnText}>{t('realestate.openUrl')}</Text>
                  </TouchableOpacity>
                </View>
              )
            })
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠ {t('realestate.disclaimer')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const TEAL = '#16A085'
const LIGHT_TEAL = '#E8F8F5'

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: TEAL,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  // ── Featured ──
  featuredSection: { backgroundColor: '#fff', paddingBottom: 16 },
  featuredLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: 'uppercase',
  },

  heroCard: {
    width: SCREEN_W,
    paddingHorizontal: 24,
    paddingVertical: 24,
    minHeight: 220,
  },
  heroIcon: { fontSize: 38, marginBottom: 8 },
  heroName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroLocation: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  heroNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 18,
    flex: 1,
  },
  heroBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 14,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: TEAL, width: 18 },

  // ── Filters ──
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  filterText: { fontSize: 12, color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  // ── Cards ──
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
    marginBottom: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardIcon: { fontSize: 22 },
  cardTitleArea: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeVerified: { backgroundColor: '#eafaf1' },
  badgePending: { backgroundColor: '#fef5e4' },
  badgeText: { fontSize: 11, color: '#333' },

  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  metaTeal: { fontSize: 12, color: TEAL, marginTop: 3 },
  note: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    backgroundColor: '#fafafa',
    padding: 8,
    borderRadius: 6,
    lineHeight: 18,
  },

  urlBtn: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  urlBtnDisabled: { backgroundColor: '#ccc' },
  urlBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  disclaimer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: LIGHT_TEAL,
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 12, color: '#0E6655', lineHeight: 18 },
})
