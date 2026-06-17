import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../src/stores/useAuthStore'
import {
  TravelCategory,
  DurationKey,
  pickTravelImages,
  uploadTravelPhotos,
  createTravelPost,
  updateTravelPost,
  fetchTravelPost,
} from '../src/lib/travel'

const { width: SW } = Dimensions.get('window')

const CATEGORIES: { key: TravelCategory; emoji: string; labelKey: string }[] = [
  { key: 'city',    emoji: '🏙️', labelKey: 'travel.filterCity'    },
  { key: 'nature',  emoji: '🌿',  labelKey: 'travel.filterNature'  },
  { key: 'culture', emoji: '⛩️', labelKey: 'travel.filterCulture' },
  { key: 'food',    emoji: '🍜',  labelKey: 'travel.filterFood'    },
]

const SEASON_KEYS = ['spring', 'summer', 'autumn', 'winter'] as const

const COST_LEVELS: { level: 1 | 2 | 3; key: string }[] = [
  { level: 1, key: 'travel.cost.1' },
  { level: 2, key: 'travel.cost.2' },
  { level: 3, key: 'travel.cost.3' },
]

const DURATION_KEYS: DurationKey[] = ['one', 'oneTwo', 'twoThree', 'threeFour', 'threeFive']

const CATEGORY_COLOR: Record<TravelCategory, string> = {
  city: '#6D28D9', nature: '#059669', culture: '#DC2626', food: '#D97706',
}

const MAX_PHOTOS = 5
const MAX_HIGHLIGHTS = 4

export default function TravelPostScreen() {
  const { t }    = useTranslation()
  const router   = useRouter()
  const { user } = useAuthStore()
  const { postId } = useLocalSearchParams<{ postId?: string }>()
  const isEdit = !!postId

  // Basic fields
  const [title, setTitle]       = useState('')
  const [location, setLocation] = useState('')
  const [description, setDesc]  = useState('')
  const [category, setCategory] = useState<TravelCategory>('city')
  const [costLevel, setCost]    = useState<1 | 2 | 3>(2)
  const [seasonTags, setSeasons] = useState<string[]>([])
  const [durationKey, setDuration] = useState<DurationKey | null>(null)

  // Rich fields
  const [highlights, setHighlights] = useState<string[]>(['', '', '', ''])
  const [tips, setTips]             = useState('')
  const [accessInfo, setAccessInfo] = useState('')

  // Photos: existingUrls (from DB) + newUris (local picks not yet uploaded)
  const [existingUrls, setExistingUrls] = useState<string[]>([])
  const [newUris, setNewUris]           = useState<string[]>([])

  // UI state
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading]       = useState(isEdit)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)

  const totalPhotos = existingUrls.length + newUris.length

  // Edit mode: load existing post
  useEffect(() => {
    if (!postId) return
    fetchTravelPost(postId)
      .then((post) => {
        setTitle(post.title)
        setLocation(post.location)
        setDesc(post.description)
        setCategory(post.category)
        setCost(post.cost_level ?? 2)
        setSeasons(post.season_tags)
        setDuration((post.duration_key as DurationKey | null) ?? null)
        const hl = post.highlights ?? []
        setHighlights([
          hl[0] ?? '', hl[1] ?? '', hl[2] ?? '', hl[3] ?? '',
        ])
        setTips(post.tips ?? '')
        setAccessInfo(post.access_info ?? '')
        // Use photo_urls array; fall back to photo_url for older posts
        setExistingUrls(post.photo_urls.length > 0 ? post.photo_urls : (post.photo_url ? [post.photo_url] : []))
      })
      .catch((e) => setErrorMsg(e.message))
      .finally(() => setLoading(false))
  }, [postId])

  function toggleSeason(key: string) {
    setSeasons((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  function updateHighlight(index: number, value: string) {
    setHighlights((prev) => prev.map((h, i) => (i === index ? value : h)))
  }

  function removeExistingPhoto(url: string) {
    setExistingUrls((prev) => prev.filter((u) => u !== url))
  }

  function removeNewPhoto(uri: string) {
    setNewUris((prev) => prev.filter((u) => u !== uri))
  }

  async function handleAddPhotos() {
    const remaining = MAX_PHOTOS - totalPhotos
    if (remaining <= 0) return
    try {
      const uris = await pickTravelImages(remaining)
      setNewUris((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS - existingUrls.length))
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleSubmit() {
    setErrorMsg(null)

    if (!user) {
      setErrorMsg('ログインが必要です / Login required')
      return
    }
    if (!title.trim() || !location.trim() || !description.trim()) {
      setErrorMsg(t('travel.post.inputErrorMsg'))
      return
    }

    try {
      setSubmitting(true)

      let uploadedUrls: string[] = []
      if (newUris.length > 0) {
        setUploading(true)
        uploadedUrls = await uploadTravelPhotos(newUris)
        setUploading(false)
      }

      const allPhotoUrls = [...existingUrls, ...uploadedUrls]

      const params = {
        title,
        description,
        location,
        category,
        photo_urls: allPhotoUrls,
        cost_level: costLevel,
        season_tags: seasonTags,
        highlights: highlights.filter((h) => h.trim()),
        tips: tips.trim() || null,
        access_info: accessInfo.trim() || null,
        duration_key: durationKey,
      }

      if (isEdit && postId) {
        await updateTravelPost(postId, params)
      } else {
        await createTravelPost(params)
      }

      setSuccess(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[TravelPost] エラー:', msg)
      setErrorMsg(msg || t('travel.post.errorDefault'))
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <View style={[s.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    )
  }

  if (success) {
    return (
      <View style={s.wrapper}>
        <View style={s.header}>
          <Text style={s.headerTitle}>
            ✈️ {isEdit ? t('travel.post.editTitle') : t('travel.post.title')}
          </Text>
        </View>
        <View style={s.successBox}>
          <Text style={s.successIcon}>✅</Text>
          <Text style={s.successTitle}>{t('travel.post.successTitle')}</Text>
          <Text style={s.successMsg}>
            {isEdit ? t('travel.post.updateSuccess') : t('travel.post.successMsg')}
          </Text>
          <TouchableOpacity style={s.successBtn} onPress={() => router.back()}>
            <Text style={s.successBtnText}>{t('travel.post.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={s.wrapper}>
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Text style={s.closeBtnText}>{t('travel.post.back')}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          ✈️ {isEdit ? t('travel.post.editTitle') : t('travel.post.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {errorMsg && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        {/* ── Photos ───────────────────────────────── */}
        <Text style={s.label}>📷 {t('travel.post.photoHint')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.photoRow}
        >
          {existingUrls.map((url) => (
            <View key={url} style={s.photoThumb}>
              <Image source={{ uri: url }} style={s.photoThumbImg} resizeMode="cover" />
              <TouchableOpacity style={s.removeBtn} onPress={() => removeExistingPhoto(url)}>
                <Text style={s.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {newUris.map((uri) => (
            <View key={uri} style={s.photoThumb}>
              <Image source={{ uri }} style={s.photoThumbImg} resizeMode="cover" />
              <TouchableOpacity style={s.removeBtn} onPress={() => removeNewPhoto(uri)}>
                <Text style={s.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {totalPhotos < MAX_PHOTOS && (
            <TouchableOpacity style={s.addPhotoBtn} onPress={handleAddPhotos} activeOpacity={0.8}>
              <Text style={s.addPhotoIcon}>📷</Text>
              <Text style={s.addPhotoText}>{t('travel.post.addPhoto')}</Text>
              <Text style={s.addPhotoCount}>{totalPhotos}/{MAX_PHOTOS}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* ── Spot name ───────────────────────────── */}
        <Text style={s.label}>{t('travel.post.spotName')} <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t('travel.post.spotNamePlaceholder')}
          placeholderTextColor="#bbb"
          maxLength={60}
        />

        {/* ── Location ────────────────────────────── */}
        <Text style={s.label}>{t('travel.post.locationLabel')} <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          value={location}
          onChangeText={setLocation}
          placeholder={t('travel.post.locationPlaceholder')}
          placeholderTextColor="#bbb"
          maxLength={60}
        />

        {/* ── Description ─────────────────────────── */}
        <Text style={s.label}>{t('travel.post.descLabel')} <Text style={s.required}>*</Text></Text>
        <TextInput
          style={[s.input, s.textarea]}
          value={description}
          onChangeText={setDesc}
          placeholder={t('travel.post.descPlaceholder')}
          placeholderTextColor="#bbb"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={s.charCount}>{description.length} / 500</Text>

        {/* ── Category ────────────────────────────── */}
        <Text style={s.label}>{t('travel.post.categoryLabel')}</Text>
        <View style={s.pillRow}>
          {CATEGORIES.map((c) => {
            const active = category === c.key
            return (
              <TouchableOpacity
                key={c.key}
                style={[s.pill, active && { backgroundColor: CATEGORY_COLOR[c.key], borderColor: CATEGORY_COLOR[c.key] }]}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.8}
              >
                <Text style={s.pillEmoji}>{c.emoji}</Text>
                <Text style={[s.pillText, active && s.pillTextActive]}>{t(c.labelKey)}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Cost ────────────────────────────────── */}
        <Text style={s.label}>{t('travel.post.costLabel')}</Text>
        <View style={s.pillRow}>
          {COST_LEVELS.map((c) => {
            const active = costLevel === c.level
            return (
              <TouchableOpacity
                key={c.level}
                style={[s.pill, active && s.pillActive]}
                onPress={() => setCost(c.level)}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{t(c.key)}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Duration ────────────────────────────── */}
        <Text style={s.label}>{t('travel.post.durationLabel')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
          {DURATION_KEYS.map((key) => {
            const active = durationKey === key
            return (
              <TouchableOpacity
                key={key}
                style={[s.pill, active && s.pillActive]}
                onPress={() => setDuration(active ? null : key)}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>
                  {t(`travel.duration.${key}`)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* ── Season ──────────────────────────────── */}
        <Text style={s.label}>{t('travel.post.seasonLabel')}</Text>
        <View style={s.pillRow}>
          {SEASON_KEYS.map((key) => {
            const active = seasonTags.includes(key)
            return (
              <TouchableOpacity
                key={key}
                style={[s.pill, active && s.pillActive]}
                onPress={() => toggleSeason(key)}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>
                  {t(`travel.season.${key}`)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Highlights ──────────────────────────── */}
        <Text style={s.label}>✨ {t('travel.post.highlightsLabel')}</Text>
        {highlights.map((h, i) => (
          <TextInput
            key={i}
            style={[s.input, { marginBottom: 8 }]}
            value={h}
            onChangeText={(v) => updateHighlight(i, v)}
            placeholder={`${i + 1}. ${t('travel.post.highlightPlaceholder')}`}
            placeholderTextColor="#bbb"
            maxLength={80}
          />
        ))}

        {/* ── Tips ────────────────────────────────── */}
        <Text style={s.label}>🇳🇵 {t('travel.post.tipsPostLabel')}</Text>
        <TextInput
          style={[s.input, s.textarea]}
          value={tips}
          onChangeText={setTips}
          placeholder={t('travel.post.tipsPlaceholder')}
          placeholderTextColor="#bbb"
          multiline
          numberOfLines={3}
          maxLength={300}
        />

        {/* ── Access info ─────────────────────────── */}
        <Text style={s.label}>🚄 {t('travel.post.accessLabel')}</Text>
        <TextInput
          style={s.input}
          value={accessInfo}
          onChangeText={setAccessInfo}
          placeholder={t('travel.post.accessPlaceholder')}
          placeholderTextColor="#bbb"
          maxLength={120}
        />

        {/* ── Submit ──────────────────────────────── */}
        <TouchableOpacity
          style={[s.submitBtn, (submitting || uploading) && s.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting || uploading}
        >
          {submitting || uploading ? (
            <View style={s.submitLoading}>
              <ActivityIndicator color="#fff" />
              <Text style={s.submitBtnText}>
                {uploading ? t('travel.post.uploading') : (isEdit ? t('travel.post.updating') : t('travel.post.submit'))}
              </Text>
            </View>
          ) : (
            <Text style={s.submitBtnText}>
              {isEdit ? t('travel.post.update') : t('travel.post.submit')}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F0F4FF' },
  header: {
    backgroundColor: '#1E3A5F',
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  scroll: { padding: 20 },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorBannerText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },

  // Photo row
  photoRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
    marginBottom: 4,
  },
  photoThumb: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbImg: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  addPhotoBtn: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDE3EE',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoIcon: { fontSize: 28 },
  addPhotoText: { fontSize: 11, color: '#888', fontWeight: '600' },
  addPhotoCount: { fontSize: 10, color: '#aaa' },

  label: { fontSize: 13, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6, marginTop: 16 },
  required: { color: '#DC2626' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DDE3EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a2e',
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 4 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDE3EE',
    backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#1E3A5F', borderColor: '#1E3A5F' },
  pillEmoji: { fontSize: 13 },
  pillText: { fontSize: 12, color: '#555', fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  submitBtn: {
    marginTop: 28,
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successIcon: { fontSize: 64 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  successMsg: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  successBtn: {
    marginTop: 16,
    backgroundColor: '#1E3A5F',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  successBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
})
