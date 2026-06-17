import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { signOut } from '@/lib/auth'
import LanguageToggle from '@/components/LanguageToggle'
import FeatureMenuModal from '@/components/FeatureMenuModal'
import {
  DESTINATIONS,
  filterDestinations,
  fetchTravelPosts,
  adminDeleteTravelPost,
  TravelCategory,
  TravelDestination,
  TravelPost,
} from '@/lib/travel'

const { width: SW } = Dimensions.get('window')
const HERO_H = 300
const PT = Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 10

const CAT_COLOR: Record<TravelCategory, string> = {
  city:    '#6D28D9',
  nature:  '#059669',
  culture: '#DC2626',
  food:    '#D97706',
}

const CAT_BG: Record<TravelCategory, string> = {
  city:    'rgba(109,40,217,0.15)',
  nature:  'rgba(5,150,105,0.15)',
  culture: 'rgba(220,38,38,0.15)',
  food:    'rgba(217,119,6,0.15)',
}

const SEASON_COLOR: Record<string, string> = {
  spring: '#EC4899',
  summer: '#F59E0B',
  autumn: '#EA580C',
  winter: '#3B82F6',
}

const FEATURED_IDS = ['tokyo', 'kyoto', 'okinawa', 'hokkaido']

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router   = useRouter()
  const { user, signOut: storeSignOut } = useAuthStore()
  const { t }    = useTranslation()
  const [cat, setCat]         = useState<'all' | TravelCategory>('all')
  const [heroIdx, setHeroIdx] = useState(0)
  const [selected, setSelected]   = useState<TravelDestination | null>(null)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [userPosts, setUserPosts] = useState<TravelPost[]>([])
  const [selectedPost, setSelectedPost] = useState<TravelPost | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const isAdmin = user?.role === 'admin'

  const featured = useMemo(
    () => DESTINATIONS.filter((d) => FEATURED_IDS.includes(d.id)),
    []
  )
  const filtered = useMemo(() => filterDestinations(DESTINATIONS, cat), [cat])

  const loadUserPosts = useCallback(async () => {
    try {
      const posts = await fetchTravelPosts()
      setUserPosts(posts)
    } catch {
      // silently ignore
    }
  }, [])

  // 画面にフォーカスが戻るたびに再取得（投稿後に反映）
  useFocusEffect(useCallback(() => { loadUserPosts() }, [loadUserPosts]))

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    storeSignOut()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Fixed Header ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.appName}>{t('home.appName')}</Text>
            {user?.name && (
              <Text style={styles.greeting}>
                {t('home.greeting')}、{user.name}{t('home.greetingSuffix')}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle />
            <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(true)}>
              <View style={styles.burgerLine} />
              <View style={styles.burgerLine} />
              <View style={styles.burgerLine} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Scrollable Content ───────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Hero Carousel */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW)
              setHeroIdx(idx)
            }}
          >
            {featured.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.heroSlide}
                onPress={() => setSelected(dest)}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: dest.photoUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                {/* Dark gradient overlay */}
                <View style={styles.heroGrad} />
                <View style={styles.heroContent}>
                  <View style={[styles.heroCatPill, { backgroundColor: CAT_COLOR[dest.category] }]}>
                    <Text style={styles.heroCatText}>
                      {t(`travel.filter${capitalize(dest.category)}`)}
                    </Text>
                  </View>
                  <Text style={styles.heroEmoji}>{dest.emoji}</Text>
                  <Text style={styles.heroName}>
                    {t(`travel.destinations.${dest.id}.name`)}
                  </Text>
                  <Text style={styles.heroPref}>
                    {t(`travel.destinations.${dest.id}.prefecture`)}
                  </Text>
                  <TouchableOpacity
                    style={styles.heroCta}
                    onPress={() => setSelected(dest)}
                  >
                    <Text style={styles.heroCtaText}>{t('travel.explore')} ›</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Page dots */}
          <View style={styles.dots}>
            {featured.map((_, i) => (
              <View key={i} style={[styles.dot, i === heroIdx && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('travel.title')}</Text>
            <Text style={styles.sectionSub}>{t('travel.subtitle')}</Text>
          </View>
          <Text style={styles.destCount}>{filtered.length}</Text>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScroll}
        >
          {(['all', 'city', 'nature', 'culture', 'food'] as const).map((f) => {
            const active = cat === f
            const color  = f === 'all' ? '#E63946' : CAT_COLOR[f]
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.pill,
                  { borderColor: active ? color : '#DDD', backgroundColor: active ? color : '#fff' },
                ]}
                onPress={() => setCat(f)}
              >
                <Text style={[styles.pillText, { color: active ? '#fff' : '#666' }]}>
                  {f === 'all' ? t('travel.filterAll') : t(`travel.filter${capitalize(f)}`)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Post button */}
        <Pressable
          style={styles.postBanner}
          onPress={() => router.push('/travel-post' as any)}
        >
          <Text style={styles.postBannerText}>＋ {t('travel.newPost')}</Text>
        </Pressable>

        {/* User submitted posts */}
        {userPosts.length > 0 && (
          <View style={styles.userPostsSection}>
            <Text style={styles.userPostsLabel}>{t('travel.userPosts')}</Text>
            {userPosts.map((post) => {
              const coverPhoto = post.photo_urls[0] ?? post.photo_url
              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.userCard}
                  onPress={() => setSelectedPost(post)}
                  activeOpacity={0.85}
                >
                  {coverPhoto ? (
                    <View>
                      <Image source={{ uri: coverPhoto }} style={styles.userCardPhoto} resizeMode="cover" />
                      {post.photo_urls.length > 1 && (
                        <View style={styles.photoCountBadge}>
                          <Text style={styles.photoCountText}>📷 {post.photo_urls.length}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={[styles.userCardPhotoPlaceholder, { backgroundColor: '#EEF2FF' }]}>
                      <Text style={{ fontSize: 32 }}>📍</Text>
                    </View>
                  )}
                  <View style={styles.userCardBody}>
                    {/* Title + category badge */}
                    <View style={styles.userCardTitleRow}>
                      <Text style={[styles.userCardTitle, { flex: 1 }]} numberOfLines={1}>{post.title}</Text>
                      <View style={[styles.userCardCatBadge, { backgroundColor: CAT_COLOR[post.category] }]}>
                        <Text style={styles.userCardCatText}>{t(`travel.filter${capitalize(post.category)}`)}</Text>
                      </View>
                    </View>
                    <Text style={styles.userCardLocation}>📍 {post.location}</Text>
                    {/* Meta chips row */}
                    <View style={styles.userCardMetaRow}>
                      {post.cost_level && (
                        <View style={styles.userCardChip}>
                          <Text style={styles.userCardChipText}>{'💴'.repeat(post.cost_level)}</Text>
                        </View>
                      )}
                      {post.duration_key && (
                        <View style={styles.userCardChip}>
                          <Text style={styles.userCardChipText}>⏱ {t(`travel.duration.${post.duration_key}`)}</Text>
                        </View>
                      )}
                      {post.season_tags.slice(0, 2).map((sk) => (
                        <View key={sk} style={[styles.userCardChip, { borderColor: SEASON_COLOR[sk] }]}>
                          <Text style={[styles.userCardChipText, { color: SEASON_COLOR[sk] }]}>{t(`travel.season.${sk}`)}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.userCardDesc} numberOfLines={2}>{post.description}</Text>
                    {isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>🛡 管理者メニューあり</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Destination cards */}
        <View style={styles.cardList}>
          {filtered.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={styles.card}
              onPress={() => setSelected(dest)}
              activeOpacity={0.85}
            >
              {/* Photo */}
              <View style={styles.cardImgBox}>
                <Image
                  source={{ uri: dest.photoUrl }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
                <View style={[styles.cardCatBadge, { backgroundColor: CAT_COLOR[dest.category] }]}>
                  <Text style={styles.cardCatBadgeText}>
                    {t(`travel.filter${capitalize(dest.category)}`)}
                  </Text>
                </View>
                {/* Season chips on image */}
                <View style={styles.cardSeasonRow}>
                  {dest.seasonKeys.map((sk) => (
                    <View key={sk} style={[styles.cardSeason, { backgroundColor: SEASON_COLOR[sk] + 'CC' }]}>
                      <Text style={styles.cardSeasonText}>{t(`travel.season.${sk}`)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Info */}
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.cardName}>
                      {dest.emoji} {t(`travel.destinations.${dest.id}.name`)}
                    </Text>
                    <Text style={styles.cardPref}>
                      {t(`travel.destinations.${dest.id}.prefecture`)}
                    </Text>
                  </View>
                  <View style={[styles.costBadge, { backgroundColor: CAT_BG[dest.category] }]}>
                    <Text style={[styles.costBadgeText, { color: CAT_COLOR[dest.category] }]}>
                      {'💴'.repeat(dest.costLevel)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardDesc} numberOfLines={2}>
                  {t(`travel.destinations.${dest.id}.desc`)}
                </Text>

                <View style={styles.cardMetaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>⏱ {t(`travel.duration.${dest.durationKey}`)}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>🚄 {t(`travel.access.${dest.accessKey}`)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.exploreBtn, { backgroundColor: CAT_COLOR[dest.category] }]}
                  onPress={() => setSelected(dest)}
                >
                  <Text style={styles.exploreBtnText}>{t('travel.explore')} ›</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Source note */}
        <View style={styles.sourceNote}>
          <Text style={styles.sourceText}>
            📷 Photos: Unsplash（CC0）  📍 Plans: japan-guide.com
          </Text>
          <Text style={styles.disclaimerText}>{t('travel.disclaimer')}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Destination Detail Modal ─────────────────── */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <DestinationDetail dest={selected} onClose={() => setSelected(null)} />
        )}
      </Modal>

      {/* ── Feature Menu ─────────────────────────────── */}
      <FeatureMenuModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSignOut={handleSignOut}
        userName={user?.name}
      />

      {/* ── User Post Detail Modal ────────────────────── */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}
      >
        {selectedPost && (
          <UserPostDetail
            post={selectedPost}
            isAdmin={isAdmin}
            deletingId={deletingId}
            onClose={() => setSelectedPost(null)}
            onEdit={() => {
              setSelectedPost(null)
              router.push((`/travel-post?postId=${selectedPost.id}`) as any)
            }}
            onDelete={async () => {
              setDeletingId(selectedPost.id)
              try {
                await adminDeleteTravelPost(selectedPost.id)
                setSelectedPost(null)
                loadUserPosts()
              } catch (e) {
                console.error('削除エラー:', e)
              } finally {
                setDeletingId(null)
              }
            }}
          />
        )}
      </Modal>
    </View>
  )
}

// ─── Destination Detail ────────────────────────────────────────────────────────

function DestinationDetail({
  dest,
  onClose,
}: {
  dest: TravelDestination
  onClose: () => void
}) {
  const { t } = useTranslation()
  const c  = CAT_COLOR[dest.category]
  const bg = CAT_BG[dest.category]

  const planDays = Array.from({ length: dest.planDayCount }, (_, i) => i + 1)

  return (
    <View style={d.root}>
      {/* Hero image */}
      <View style={d.heroBox}>
        <Image source={{ uri: dest.photoUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={d.heroGrad} />
        {/* Back button */}
        <TouchableOpacity style={d.backBtn} onPress={onClose}>
          <Text style={d.backBtnText}>← {t('travel.close')}</Text>
        </TouchableOpacity>
        {/* Destination info */}
        <View style={d.heroInfo}>
          <View style={[d.catPill, { backgroundColor: c }]}>
            <Text style={d.catPillText}>{t(`travel.filter${capitalize(dest.category)}`)}</Text>
          </View>
          <Text style={d.heroEmoji}>{dest.emoji}</Text>
          <Text style={d.heroName}>{t(`travel.destinations.${dest.id}.name`)}</Text>
          <Text style={d.heroPref}>{t(`travel.destinations.${dest.id}.prefecture`)}</Text>
        </View>
      </View>

      <ScrollView style={d.scroll} showsVerticalScrollIndicator={false}>
        {/* Quick info */}
        <View style={d.quickRow}>
          {[
            { icon: '⏱', label: t('travel.durationLabel'), val: t(`travel.duration.${dest.durationKey}`) },
            { icon: '💴', label: t('travel.costLabel'),     val: t(`travel.cost.${dest.costLevel}`) },
            { icon: '🚄', label: t('travel.fromTokyoLabel'), val: t(`travel.access.${dest.accessKey}`) },
          ].map((q) => (
            <View key={q.label} style={d.quickCard}>
              <Text style={d.quickIcon}>{q.icon}</Text>
              <Text style={d.quickLabel}>{q.label}</Text>
              <Text style={d.quickVal} numberOfLines={2}>{q.val}</Text>
            </View>
          ))}
        </View>

        {/* Best seasons */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>🌤 {t('travel.seasonLabel')}</Text>
          <View style={d.seasonRow}>
            {dest.seasonKeys.map((sk) => (
              <View key={sk} style={[d.seasonBadge, { backgroundColor: SEASON_COLOR[sk] + '22', borderColor: SEASON_COLOR[sk] }]}>
                <Text style={[d.seasonBadgeText, { color: SEASON_COLOR[sk] }]}>
                  {t(`travel.season.${sk}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>📖 {t('travel.aboutLabel')}</Text>
          <Text style={d.bodyText}>{t(`travel.destinations.${dest.id}.desc`)}</Text>
        </View>

        {/* Travel Plan */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>🗓 {t('travel.planLabel')}</Text>
          <Text style={d.planTitle}>
            {t(`travel.destinations.${dest.id}.plan.title`)}
          </Text>
          {planDays.map((day) => (
            <View key={day} style={[d.planDay, { borderLeftColor: c }]}>
              <View style={[d.dayBadge, { backgroundColor: c }]}>
                <Text style={d.dayBadgeText}>Day {day}</Text>
              </View>
              <Text style={d.planText}>
                {t(`travel.destinations.${dest.id}.plan.day${day}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* Highlights */}
        <View style={d.section}>
          <Text style={d.sectionTitle}>✨ {t('travel.highlightsLabel')}</Text>
          {dest.highlightKeys.map((h, i) => (
            <View key={h} style={[d.highlight, { borderLeftColor: c }]}>
              <View style={[d.hlNum, { backgroundColor: c }]}>
                <Text style={d.hlNumText}>{i + 1}</Text>
              </View>
              <Text style={d.hlText}>
                {t(`travel.destinations.${dest.id}.highlights.${h}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* Tips for Nepali travelers */}
        <View style={[d.tipBox, { backgroundColor: bg, borderLeftColor: c }]}>
          <Text style={[d.tipTitle, { color: c }]}>🇳🇵 {t('travel.tipsLabel')}</Text>
          <Text style={d.tipText}>{t(`travel.destinations.${dest.id}.tips`)}</Text>
        </View>

        {/* Source */}
        <Text style={d.source}>
          📷 Photo: Unsplash（CC0）　📍 Plan source: japan-guide.com
        </Text>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

// ─── Utils ─────────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const RED = '#E63946'

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4F8' },

  // Header
  header: {
    backgroundColor: RED,
    paddingTop: PT,
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  burgerLine: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#fff',
  },

  scroll: { flex: 1 },

  // Hero carousel
  heroSlide: {
    width: SW,
    height: HERO_H,
    overflow: 'hidden',
  },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroCatPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroCatText: { fontSize: 11, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  heroEmoji: { fontSize: 36, marginBottom: 4 },
  heroName:  { fontSize: 30, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroPref:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroCtaText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Dots
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: '#fff' },
  dot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DDD' },
  dotActive: { width: 20, backgroundColor: RED },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  sectionSub:   { fontSize: 12, color: '#999', marginTop: 2 },
  destCount: {
    fontSize: 24,
    fontWeight: '900',
    color: RED,
  },

  // Filter
  filterScroll: { backgroundColor: '#fff', paddingBottom: 4 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 14, gap: 8, flexDirection: 'row' },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 12, fontWeight: '700' },

  // User posts
  userPostsSection: { paddingHorizontal: 16, marginBottom: 8 },
  userPostsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  userCardPhoto: { width: '100%', height: 140 },
  userCardPhotoPlaceholder: {
    width: '100%',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCardBody: { padding: 12 },
  userCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  userCardTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  userCardCatBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  userCardCatText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  userCardLocation: { fontSize: 11, color: '#999', marginBottom: 6 },
  userCardMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  userCardChip: {
    borderWidth: 1,
    borderColor: '#DDE3EE',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  userCardChipText: { fontSize: 10, color: '#666', fontWeight: '600' },
  userCardDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
  adminBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adminBadgeText: { fontSize: 10, color: '#92400E', fontWeight: '700' },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoCountText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Post banner
  postBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#E63946',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBannerText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Destination cards
  cardList: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardImgBox: { height: 180, position: 'relative' },
  cardImg:    { width: '100%', height: '100%' },
  cardCatBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardCatBadgeText: { fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  cardSeasonRow: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardSeason: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardSeasonText: { fontSize: 10, color: '#fff', fontWeight: '600' },

  cardBody: { padding: 16 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardName: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  cardPref: { fontSize: 11, color: '#AAA' },
  costBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  costBadgeText: { fontSize: 12, fontWeight: '700' },

  cardDesc: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 12 },

  cardMetaRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  metaChip: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: { fontSize: 11, color: '#555', fontWeight: '600' },

  exploreBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Source note
  sourceNote: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 4,
  },
  sourceText:     { fontSize: 11, color: '#AAA', textAlign: 'center' },
  disclaimerText: { fontSize: 10, color: '#CCC', textAlign: 'center' },
})

// Detail modal styles
const d = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4F8' },

  heroBox: { height: HERO_H + 40, position: 'relative' },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  backBtn: {
    position: 'absolute',
    top: PT,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  catPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  catPillText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  heroEmoji: { fontSize: 40, marginBottom: 4 },
  heroName:  { fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroPref:  { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  scroll: { flex: 1 },

  quickRow: {
    flexDirection: 'row',
    margin: 16,
    gap: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIcon:  { fontSize: 20, marginBottom: 4 },
  quickLabel: { fontSize: 9, color: '#AAA', fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  quickVal:   { fontSize: 11, color: '#333', fontWeight: '700', textAlign: 'center' },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },

  seasonRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  seasonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  seasonBadgeText: { fontSize: 12, fontWeight: '700' },

  bodyText: { fontSize: 14, color: '#444', lineHeight: 22 },

  // Plan
  planTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  planDay: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 14,
    gap: 6,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  dayBadgeText: { fontSize: 11, color: '#fff', fontWeight: '800' },
  planText: { fontSize: 13, color: '#444', lineHeight: 20 },

  // Highlights
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 10,
    gap: 10,
  },
  hlNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hlNumText: { fontSize: 11, color: '#fff', fontWeight: '800' },
  hlText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },

  // Tips
  tipBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  tipTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  tipText:  { fontSize: 13, color: '#555', lineHeight: 20 },

  source: {
    fontSize: 10,
    color: '#CCC',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
})

// ─── User Post Detail ──────────────────────────────────────────────────────────

const CATEGORY_COLOR_MAP: Record<string, string> = {
  city: '#6D28D9', nature: '#059669', culture: '#DC2626', food: '#D97706',
}
const SEASON_COLOR_MAP: Record<string, string> = {
  spring: '#EC4899', summer: '#F59E0B', autumn: '#EA580C', winter: '#3B82F6',
}

function UserPostDetail({
  post,
  isAdmin,
  deletingId,
  onClose,
  onEdit,
  onDelete,
}: {
  post: TravelPost
  isAdmin: boolean
  deletingId: string | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const [photoIdx, setPhotoIdx] = useState(0)
  const c = CATEGORY_COLOR_MAP[post.category] ?? '#1E3A5F'
  const bg = c + '18'
  const isDeleting = deletingId === post.id

  const photos = post.photo_urls.length > 0
    ? post.photo_urls
    : (post.photo_url ? [post.photo_url] : [])
  const highlights = (post.highlights ?? []).filter(Boolean)
  const hlPhotos = post.highlight_photos ?? []

  return (
    <View style={pd.wrapper}>
      {/* Header */}
      <View style={[pd.header, { backgroundColor: c }]}>
        <TouchableOpacity style={pd.backBtn} onPress={onClose}>
          <Text style={pd.backBtnText}>← {t('travel.close')}</Text>
        </TouchableOpacity>
        <Text style={pd.headerTitle} numberOfLines={1}>{post.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo carousel or placeholder */}
        {photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={pd.photoCarousel}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW)
              setPhotoIdx(idx)
            }}
          >
            {photos.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={pd.carouselPhoto} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={[pd.photoPlaceholder, { backgroundColor: bg }]}>
            <Text style={{ fontSize: 48 }}>📍</Text>
          </View>
        )}
        {photos.length > 1 && (
          <View style={pd.dotRow}>
            {photos.map((_, i) => (
              <View key={i} style={[pd.dot, i === photoIdx && { backgroundColor: c, width: 16 }]} />
            ))}
          </View>
        )}

        <View style={pd.body}>
          {/* ── 場所 ── */}
          <View style={pd.labeledRow}>
            <Text style={pd.fieldLabel}>📍 {t('travel.post.locationLabel')}</Text>
            <Text style={pd.fieldValue}>{post.location}</Text>
          </View>

          {/* ── カテゴリ ── */}
          <View style={pd.labeledRow}>
            <Text style={pd.fieldLabel}>🗂 {t('travel.post.categoryLabel')}</Text>
            <View style={[pd.catBadge, { backgroundColor: c }]}>
              <Text style={pd.catBadgeText}>{t(`travel.filter${capitalize(post.category)}`)}</Text>
            </View>
          </View>

          {/* ── 費用目安 ── */}
          {post.cost_level && (
            <View style={pd.labeledRow}>
              <Text style={pd.fieldLabel}>💴 {t('travel.post.costLabel')}</Text>
              <Text style={pd.fieldValue}>{t(`travel.cost.${post.cost_level}`)}</Text>
            </View>
          )}

          {/* ── 滞在期間 ── */}
          {post.duration_key && (
            <View style={pd.labeledRow}>
              <Text style={pd.fieldLabel}>⏱ {t('travel.post.durationLabel')}</Text>
              <Text style={pd.fieldValue}>{t(`travel.duration.${post.duration_key}`)}</Text>
            </View>
          )}

          {/* ── おすすめ季節 ── */}
          {post.season_tags.length > 0 && (
            <View style={pd.labeledBlock}>
              <Text style={pd.fieldLabel}>🌤 {t('travel.seasonLabel')}</Text>
              <View style={pd.seasonRow}>
                {post.season_tags.map((sk) => (
                  <View key={sk} style={[pd.seasonTag, { borderColor: SEASON_COLOR_MAP[sk] ?? '#999' }]}>
                    <Text style={[pd.seasonTagText, { color: SEASON_COLOR_MAP[sk] ?? '#999' }]}>
                      {t(`travel.season.${sk}`)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── アクセス方法 ── */}
          {post.access_info ? (
            <View style={[pd.labeledBlock, { backgroundColor: bg, borderRadius: 12, padding: 12 }]}>
              <Text style={[pd.fieldLabel, { color: c }]}>🚄 {t('travel.post.accessLabel')}</Text>
              <Text style={pd.fieldValue}>{post.access_info}</Text>
            </View>
          ) : null}

          {/* ── 概要 ── */}
          <View style={pd.section}>
            <Text style={pd.sectionTitle}>📖 {t('travel.aboutLabel')}</Text>
            <Text style={pd.desc}>{post.description}</Text>
          </View>

          {/* ── 見どころ ── */}
          {highlights.length > 0 && (
            <View style={pd.section}>
              <Text style={pd.sectionTitle}>✨ {t('travel.highlightsLabel')}</Text>
              {highlights.map((h, i) => {
                const hlPhoto = hlPhotos[i] && hlPhotos[i] !== '' ? hlPhotos[i] : null
                return (
                  <View key={i} style={pd.hlItem}>
                    <View style={[pd.highlight, { borderLeftColor: c }]}>
                      <View style={[pd.hlNum, { backgroundColor: c }]}>
                        <Text style={pd.hlNumText}>{i + 1}</Text>
                      </View>
                      <Text style={pd.hlText}>{h}</Text>
                    </View>
                    {hlPhoto && (
                      <Image source={{ uri: hlPhoto }} style={pd.hlPhoto} resizeMode="cover" />
                    )}
                  </View>
                )
              })}
            </View>
          )}

          {/* ── アドバイス ── */}
          {post.tips ? (
            <View style={[pd.tipBox, { backgroundColor: bg, borderLeftColor: c }]}>
              <Text style={[pd.tipTitle, { color: c }]}>🇳🇵 {t('travel.tipsLabel')}</Text>
              <Text style={pd.tipText}>{post.tips}</Text>
            </View>
          ) : null}

          {/* ── フッター（いいね・投稿日） ── */}
          <View style={pd.footerRow}>
            {post.like_count > 0 && (
              <Text style={pd.likeCount}>❤️ {post.like_count}</Text>
            )}
            <View style={pd.dateBlock}>
              <Text style={pd.dateLabel}>投稿日</Text>
              <Text style={pd.date}>{new Date(post.created_at).toLocaleDateString('ja-JP')}</Text>
            </View>
          </View>

          {/* Admin controls */}
          {isAdmin && (
            <View style={pd.adminBox}>
              <Text style={pd.adminTitle}>🛡 管理者メニュー</Text>
              <TouchableOpacity style={pd.editBtn} onPress={onEdit}>
                <Text style={pd.editBtnText}>✏️ 編集する</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[pd.deleteBtn, isDeleting && pd.deleteBtnDisabled]}
                onPress={onDelete}
                disabled={isDeleting}
              >
                {isDeleting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={pd.deleteBtnText}>🗑 削除する</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const pd = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold', flex: 1 },

  // Photo carousel
  photoCarousel: { height: 240 },
  carouselPhoto: { width: SW, height: 240 },
  photoPlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CCC', overflow: 'hidden' },

  body: { padding: 20 },

  // ラベル付き行（横並び）
  labeledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  // ラベル付きブロック（縦並び）
  labeledBlock: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#888' },
  fieldValue: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', flexShrink: 1, textAlign: 'right' },

  catBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  catBadgeText: { fontSize: 11, color: '#fff', fontWeight: '800' },

  seasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  seasonTag: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  seasonTagText: { fontSize: 11, fontWeight: '700' },

  // Content sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
  desc: { fontSize: 14, color: '#444', lineHeight: 22 },

  // Highlights
  hlItem: { marginBottom: 12 },
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 6,
    gap: 10,
  },
  hlNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  hlNumText: { fontSize: 11, color: '#fff', fontWeight: '800' },
  hlText: { flex: 1, fontSize: 13, color: '#444', lineHeight: 20 },
  hlPhoto: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 4,
  },

  // Tips
  tipBox: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  tipTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  tipText: { fontSize: 13, color: '#555', lineHeight: 20 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, marginTop: 4 },
  likeCount: { fontSize: 13, color: '#E63946', fontWeight: '700' },
  dateBlock: { alignItems: 'flex-end' },
  dateLabel: { fontSize: 10, color: '#bbb', marginBottom: 2 },
  date: { fontSize: 12, color: '#888', fontWeight: '600' },

  adminBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 10,
  },
  adminTitle: { fontSize: 13, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
  editBtn: { backgroundColor: '#1E3A5F', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  deleteBtn: { backgroundColor: '#DC2626', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  deleteBtnDisabled: { opacity: 0.6 },
  deleteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
})
