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
import { PIZZA_SHOPS, filterShops, PizzaCategory } from '../../src/lib/pizza'

const { width: SCREEN_W } = Dimensions.get('window')
type FilterValue = 'all' | PizzaCategory

function categoryIcon(cat: PizzaCategory): string {
  switch (cat) {
    case 'chain':    return '🍕'
    case 'delivery': return '🛵'
    case 'parttime': return '💼'
  }
}

function categoryColor(cat: PizzaCategory): string {
  switch (cat) {
    case 'chain':    return '#E63946'
    case 'delivery': return '#E67E22'
    case 'parttime': return '#8E44AD'
  }
}

export default function PizzaScreen() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [heroIndex, setHeroIndex] = useState(0)

  const filtered = filterShops(PIZZA_SHOPS, filter)

  const filters: { key: FilterValue; label: string }[] = [
    { key: 'all',      label: t('pizza.filterAll') },
    { key: 'chain',    label: t('pizza.filterChain') },
    { key: 'delivery', label: t('pizza.filterDelivery') },
    { key: 'parttime', label: t('pizza.filterParttime') },
  ]

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('pizza.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Featured hero cards ── */}
        <View style={styles.featuredSection}>
          <Text style={styles.featuredLabel}>{t('pizza.featuredTitle')}</Text>

          <FlatList
            data={PIZZA_SHOPS}
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
                    {t(`pizza.shops.${item.id}.name`)}
                  </Text>
                  <Text style={styles.heroLocation}>📍 {item.location}</Text>
                  <Text style={styles.heroNote}>
                    {t(`pizza.shops.${item.id}.note`)}
                  </Text>
                  <TouchableOpacity
                    style={styles.heroBtn}
                    onPress={() => Linking.openURL(item.url)}
                  >
                    <Text style={styles.heroBtnText}>{t('pizza.openUrl')}</Text>
                  </TouchableOpacity>
                </View>
              )
            }}
          />

          {/* Pagination dots */}
          <View style={styles.dots}>
            {PIZZA_SHOPS.map((_, i) => (
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

        {/* ── Shop cards ── */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <Text style={styles.noResults}>{t('pizza.noResults')}</Text>
          ) : (
            filtered.map((shop) => {
              const color = categoryColor(shop.category)
              return (
                <View key={shop.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconBox, { backgroundColor: color + '22' }]}>
                      <Text style={styles.cardIcon}>{categoryIcon(shop.category)}</Text>
                    </View>
                    <View style={styles.cardTitleArea}>
                      <Text style={styles.cardName}>
                        {t(`pizza.shops.${shop.id}.name`)}
                      </Text>
                      <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
                          <Text style={[styles.badgeText, { color }]}>
                            {t(`pizza.filter${shop.category.charAt(0).toUpperCase() + shop.category.slice(1)}`)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            shop.isVerified ? styles.badgeVerified : styles.badgePending,
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {shop.isVerified
                              ? `✅ ${t('pizza.verified')}`
                              : `⏳ ${t('pizza.pending')}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.meta}>📍 {shop.location}</Text>

                  <Text style={styles.note}>
                    {t(`pizza.shops.${shop.id}.note`)}
                  </Text>

                  <TouchableOpacity
                    style={[styles.urlBtn, { backgroundColor: color }]}
                    onPress={() => Linking.openURL(shop.url)}
                  >
                    <Text style={styles.urlBtnText}>{t('pizza.openUrl')}</Text>
                  </TouchableOpacity>
                </View>
              )
            })
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠ {t('pizza.disclaimer')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const RED = '#E63946'
const LIGHT_RED = '#FDEDEE'

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: RED,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

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
  dotActive: { backgroundColor: RED, width: 18 },

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
  filterBtnActive: { backgroundColor: RED, borderColor: RED },
  filterText: { fontSize: 12, color: '#555' },
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
  urlBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  disclaimer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: LIGHT_RED,
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 12, color: '#922B21', lineHeight: 18 },
})
