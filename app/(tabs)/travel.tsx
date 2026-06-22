import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  Modal,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  ListRenderItemInfo,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  DESTINATIONS,
  filterDestinations,
  fetchTravelPosts,
  TravelCategory,
  TravelDestination,
  TravelPost,
} from '../../src/lib/travel'

const { width: SW } = Dimensions.get('window')

type FilterValue = 'all' | TravelCategory

const CATEGORY_COLOR: Record<TravelCategory, string> = {
  city: '#6D28D9',
  nature: '#059669',
  culture: '#DC2626',
  food: '#D97706',
}

const CATEGORY_LIGHT: Record<TravelCategory, string> = {
  city: '#EDE9FE',
  nature: '#D1FAE5',
  culture: '#FEE2E2',
  food: '#FEF3C7',
}

const SEASON_COLOR: Record<string, string> = {
  spring: '#EC4899',
  summer: '#F59E0B',
  autumn: '#EA580C',
  winter: '#3B82F6',
}

const FEATURED_BG: Record<TravelCategory, string[]> = {
  city:    ['#4C1D95', '#7C3AED'],
  nature:  ['#064E3B', '#059669'],
  culture: ['#7F1D1D', '#DC2626'],
  food:    ['#78350F', '#D97706'],
}

function categoryTransKey(cat: TravelCategory): string {
  const map: Record<TravelCategory, string> = {
    city: 'travel.filterCity',
    nature: 'travel.filterNature',
    culture: 'travel.filterCulture',
    food: 'travel.filterFood',
  }
  return map[cat]
}

// ── Destination Card ──────────────────────────────────────────────────────────

interface DestinationCardProps {
  dest: TravelDestination
  onPress: (dest: TravelDestination) => void
  t: (key: string) => string
}

function DestinationCard({ dest, onPress, t }: DestinationCardProps) {
  const c = CATEGORY_COLOR[dest.category]
  const lc = CATEGORY_LIGHT[dest.category]

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => onPress(dest)}
      activeOpacity={0.78}
    >
      <View style={[s.cardBar, { backgroundColor: c }]} />
      <View style={s.cardBody}>
        {/* Top row */}
        <View style={s.cardTop}>
          <View style={[s.cardEmojiBox, { backgroundColor: lc }]}>
            <Text style={s.cardEmoji}>{dest.emoji}</Text>
          </View>
          <View style={s.cardMid}>
            <Text style={s.cardName}>
              {t(`travel.destinations.${dest.id}.name`)}
            </Text>
            <Text style={s.cardPref}>
              {t(`travel.destinations.${dest.id}.prefecture`)}
            </Text>
            <View style={[s.catBadge, { backgroundColor: lc }]}>
              <Text style={[s.catBadgeText, { color: c }]}>
                {t(categoryTransKey(dest.category))}
              </Text>
            </View>
          </View>
          <Text style={s.costDots}>{'💴'.repeat(dest.costLevel)}</Text>
        </View>

        {/* Description preview */}
        <Text style={s.cardDesc} numberOfLines={2}>
          {t(`travel.destinations.${dest.id}.desc`)}
        </Text>

        {/* Bottom row */}
        <View style={s.cardBottom}>
          <View style={s.seasonRow}>
            {dest.seasonKeys.map((sk) => (
              <View
                key={sk}
                style={[s.seasonTag, { borderColor: SEASON_COLOR[sk] + '99' }]}
              >
                <Text style={[s.seasonTagText, { color: SEASON_COLOR[sk] }]}>
                  {t(`travel.season.${sk}`)}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[s.exploreBtn, { backgroundColor: c }]}
            onPress={() => onPress(dest)}
          >
            <Text style={s.exploreBtnText}>{t('travel.explore')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TravelScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selected, setSelected] = useState<TravelDestination | null>(null)
  const [userPosts, setUserPosts] = useState<TravelPost[]>([])
  const filtered = useMemo(() => filterDestinations(DESTINATIONS, filter), [filter])

  const loadPosts = useCallback(async () => {
    try {
      const posts = await fetchTravelPosts(filter === 'all' ? undefined : filter)
      setUserPosts(posts)
    } catch {
      // silently ignore fetch errors
    }
  }, [filter])

  useEffect(() => { loadPosts() }, [loadPosts])

  const filters: { key: FilterValue; emoji: string; labelKey: string }[] = [
    { key: 'all',     emoji: '🗾',  labelKey: 'travel.filterAll'     },
    { key: 'city',    emoji: '🏙️', labelKey: 'travel.filterCity'    },
    { key: 'nature',  emoji: '🌿',  labelKey: 'travel.filterNature'  },
    { key: 'culture', emoji: '⛩️', labelKey: 'travel.filterCulture' },
    { key: 'food',    emoji: '🍜',  labelKey: 'travel.filterFood'    },
  ]

  const handleDestPress = useCallback((dest: TravelDestination) => {
    setSelected(dest)
  }, [])

  const renderDestCard = useCallback(
    ({ item }: ListRenderItemInfo<TravelDestination>) => (
      <DestinationCard dest={item} onPress={handleDestPress} t={t} />
    ),
    [handleDestPress, t]
  )

  const ListHeader = useMemo(() => (
    <>
      {/* ── Featured carousel (all view only) ── */}
      {filter === 'all' && (
        <View style={s.featSection}>
          <Text style={s.sectionLabel}>{t('travel.featured')}</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {DESTINATIONS.slice(0, 4).map((item) => {
              const [bgDark, bgLight] = FEATURED_BG[item.category]
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.featCard, { backgroundColor: bgDark }]}
                  onPress={() => setSelected(item)}
                  activeOpacity={0.88}
                >
                  {/* Decorative circle */}
                  <View style={[s.featDeco, { backgroundColor: bgLight + '55' }]} />

                  <Text style={s.featEmoji}>{item.emoji}</Text>
                  <Text style={s.featName}>{t(`travel.destinations.${item.id}.name`)}</Text>
                  <Text style={s.featPref}>{t(`travel.destinations.${item.id}.prefecture`)}</Text>
                  <Text style={s.featDesc} numberOfLines={2}>
                    {t(`travel.destinations.${item.id}.desc`)}
                  </Text>

                  <View style={s.featSeasons}>
                    {item.seasonKeys.map((sk) => (
                      <View
                        key={sk}
                        style={[s.featSeason, { backgroundColor: 'rgba(255,255,255,0.22)' }]}
                      >
                        <Text style={s.featSeasonText}>{t(`travel.season.${sk}`)}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={s.featFooter}>
                    <Text style={s.featCost}>{'💴'.repeat(item.costLevel)}</Text>
                    <View style={s.featBtn}>
                      <Text style={s.featBtnText}>{t('travel.explore')} →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {/* ── User posts ── */}
      {userPosts.length > 0 && (
        <View style={s.userPostsSection}>
          <Text style={s.sectionLabel}>{t('travel.userPosts')}</Text>
          {userPosts.map((post) => {
            const c = CATEGORY_COLOR[post.category]
            const lc = CATEGORY_LIGHT[post.category]
            return (
              <View key={post.id} style={s.userCard}>
                {post.photo_url ? (
                  <Image
                    source={{ uri: post.photo_url }}
                    style={s.userCardPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[s.userCardPhotoPlaceholder, { backgroundColor: lc }]}>
                    <Text style={{ fontSize: 32 }}>📍</Text>
                  </View>
                )}
                <View style={[s.userCardBar, { backgroundColor: c }]} />
                <View style={s.userCardBody}>
                  <View style={s.userCardTop}>
                    <Text style={s.userCardTitle} numberOfLines={1}>{post.title}</Text>
                    <View style={[s.catBadge, { backgroundColor: lc }]}>
                      <Text style={[s.catBadgeText, { color: c }]}>
                        {t(categoryTransKey(post.category))}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.userCardLocation}>📍 {post.location}</Text>
                  <Text style={s.userCardDesc} numberOfLines={2}>{post.description}</Text>
                  {post.season_tags.length > 0 && (
                    <View style={s.seasonRow}>
                      {post.season_tags.map((sk) => (
                        <View key={sk} style={[s.seasonTag, { borderColor: SEASON_COLOR[sk] + '99' }]}>
                          <Text style={[s.seasonTagText, { color: SEASON_COLOR[sk] }]}>
                            {t(`travel.season.${sk}`)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Destination list header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }} />
    </>
  ), [filter, userPosts, t])

  const ListFooter = (
    <>
      <View style={s.disclaimer}>
        <Text style={s.disclaimerText}>ℹ️ {t('travel.disclaimer')}</Text>
      </View>
      <View style={{ height: 30 }} />
    </>
  )

  return (
    <View style={s.wrapper}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerCircle1} />
        <View style={s.headerCircle2} />
        <Text style={s.headerEmoji}>🗾</Text>
        <Text style={s.headerTitle}>{t('travel.title')}</Text>
        <Text style={s.headerSub}>{t('travel.subtitle')}</Text>
      </View>

      {/* ── Category filter pills ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {filters.map((f) => {
          const active = filter === f.key
          const activeBg =
            active && f.key !== 'all'
              ? CATEGORY_COLOR[f.key as TravelCategory]
              : active
              ? '#1E3A5F'
              : '#fff'
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                s.pill,
                {
                  backgroundColor: activeBg,
                  borderColor: active ? activeBg : '#DDD',
                },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={s.pillEmoji}>{f.emoji}</Text>
              <Text style={[s.pillText, active && s.pillTextActive]}>
                {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* ── 投稿ボタン ── */}
      <Pressable
        style={s.postBanner}
        onPress={() => router.push('/travel-post' as any)}
      >
        <Text style={s.postBannerText}>＋ スポットを投稿する</Text>
      </Pressable>

      {/* ── Destination list (virtualized) ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listWrap}
        renderItem={renderDestCard}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
      />

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <DestinationDetail
            dest={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
    </View>
  )
}

// ── Destination Detail ────────────────────────────────────────────────────────

function DestinationDetail({
  dest,
  onClose,
}: {
  dest: TravelDestination
  onClose: () => void
}) {
  const { t } = useTranslation()
  const c = CATEGORY_COLOR[dest.category]
  const lc = CATEGORY_LIGHT[dest.category]

  return (
    <View style={d.wrapper}>
      {/* ── Hero header ── */}
      <View style={[d.hero, { backgroundColor: FEATURED_BG[dest.category][0] }]}>
        <View style={d.heroCircle} />
        <TouchableOpacity style={d.closeBtn} onPress={onClose}>
          <Text style={d.closeBtnText}>← {t('travel.close')}</Text>
        </TouchableOpacity>
        <Text style={d.heroEmoji}>{dest.emoji}</Text>
        <Text style={d.heroName}>{t(`travel.destinations.${dest.id}.name`)}</Text>
        <Text style={d.heroPref}>{t(`travel.destinations.${dest.id}.prefecture`)}</Text>
        <View style={[d.heroCatBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
          <Text style={d.heroCatBadgeText}>{t(categoryTransKey(dest.category))}</Text>
        </View>
      </View>

      <ScrollView style={d.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Quick info row ── */}
        <View style={d.quickRow}>
          <View style={d.quickCard}>
            <Text style={d.quickIcon}>⏱</Text>
            <Text style={d.quickLabel}>{t('travel.durationLabel')}</Text>
            <Text style={d.quickVal}>{t(`travel.duration.${dest.durationKey}`)}</Text>
          </View>
          <View style={d.quickCard}>
            <Text style={d.quickIcon}>💴</Text>
            <Text style={d.quickLabel}>{t('travel.costLabel')}</Text>
            <Text style={d.quickVal}>{t(`travel.cost.${dest.costLevel}`)}</Text>
          </View>
          <View style={[d.quickCard, { flex: 1.6 }]}>
            <Text style={d.quickIcon}>🚄</Text>
            <Text style={d.quickLabel}>{t('travel.fromTokyoLabel')}</Text>
            <Text style={d.quickVal} numberOfLines={2}>
              {t(`travel.access.${dest.accessKey}`)}
            </Text>
          </View>
        </View>

        {/* ── Best seasons ── */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>🌤 {t('travel.seasonLabel')}</Text>
          <View style={d.seasonBadgeRow}>
            {dest.seasonKeys.map((sk) => (
              <View
                key={sk}
                style={[
                  d.seasonBadge,
                  { backgroundColor: SEASON_COLOR[sk] + '22', borderColor: SEASON_COLOR[sk] },
                ]}
              >
                <Text style={[d.seasonBadgeText, { color: SEASON_COLOR[sk] }]}>
                  {t(`travel.season.${sk}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── About ── */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>📖 {t('travel.aboutLabel')}</Text>
          <Text style={d.descText}>{t(`travel.destinations.${dest.id}.desc`)}</Text>
        </View>

        {/* ── Highlights ── */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>✨ {t('travel.highlightsLabel')}</Text>
          {dest.highlightKeys.map((h, i) => (
            <View key={h} style={[d.highlightItem, { borderLeftColor: c }]}>
              <View style={[d.highlightNum, { backgroundColor: c }]}>
                <Text style={d.highlightNumText}>{i + 1}</Text>
              </View>
              <Text style={d.highlightText}>
                {t(`travel.destinations.${dest.id}.highlights.${h}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Nepali traveler tips ── */}
        <View style={[d.tipBox, { backgroundColor: lc, borderLeftColor: c }]}>
          <Text style={[d.tipTitle, { color: c }]}>
            🇳🇵 {t('travel.tipsLabel')}
          </Text>
          <Text style={d.tipText}>{t(`travel.destinations.${dest.id}.tips`)}</Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  )
}

// ─────────────── Styles ───────────────

const HEADER_COLOR = '#1E3A5F'

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F0F4FF' },

  // Header
  header: {
    backgroundColor: HEADER_COLOR,
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: 0,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    zIndex: 0,
  },
  headerEmoji: { fontSize: 46, marginBottom: 10, zIndex: 1 },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'center',
    marginBottom: 12,
  },
  postBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#E63946',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  } as any,
  postBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Filter pills
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 12, color: '#555', fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  // Featured section
  featSection: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  featCard: {
    width: SW,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    overflow: 'hidden',
    minHeight: 260,
    justifyContent: 'flex-end',
  },
  featDeco: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  featEmoji: { fontSize: 52, marginBottom: 10 },
  featName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  featPref: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 8,
  },
  featDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 14,
  },
  featSeasons: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  featSeason: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  featSeasonText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  featFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featCost: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  featBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // Destination list
  listWrap: { paddingHorizontal: 16, gap: 12, paddingBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardBar: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  cardEmojiBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 28 },
  cardMid: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 1,
  },
  cardPref: { fontSize: 11, color: '#999', marginBottom: 5 },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  catBadgeText: { fontSize: 10, fontWeight: 'bold' },
  costDots: { fontSize: 11, marginTop: 2, color: '#555' },
  cardDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  seasonRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  seasonTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  seasonTagText: { fontSize: 10, fontWeight: '600' },
  exploreBtn: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 10,
  },
  exploreBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // User posts
  userPostsSection: { paddingHorizontal: 16, paddingTop: 8, gap: 12, marginBottom: 4 },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 12,
  },
  userCardPhoto: { width: '100%', height: 160 },
  userCardPhotoPlaceholder: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCardBar: { height: 4 },
  userCardBody: { padding: 14 },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  userCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  userCardLocation: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  userCardDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },

  // Disclaimer
  disclaimer: {
    margin: 16,
    padding: 14,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#93C5FD',
  },
  disclaimerText: { fontSize: 11, color: '#3B82F6', lineHeight: 17 },
})

const d = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },

  // Hero
  hero: {
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 42,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  heroEmoji: { fontSize: 64, marginBottom: 10 },
  heroName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroPref: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },
  heroCatBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  heroCatBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  scroll: { flex: 1, backgroundColor: '#F8FAFF' },

  // Quick info
  quickRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: '#fff',
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  quickIcon: { fontSize: 22 },
  quickLabel: {
    fontSize: 9,
    color: '#aaa',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  quickVal: {
    fontSize: 11,
    color: '#1a1a2e',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 12,
  },

  // Season badges
  seasonBadgeRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', paddingBottom: 16 },
  seasonBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  seasonBadgeText: { fontSize: 14, fontWeight: '600' },

  // Description
  descText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 23,
    paddingBottom: 16,
  },

  // Highlights
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
    gap: 10,
  },
  highlightNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highlightNumText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  highlightText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },

  // Tips box
  tipBox: {
    margin: 16,
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
  },
  tipTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  tipText: { fontSize: 13, color: '#555', lineHeight: 22 },
})
