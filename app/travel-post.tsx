import { useState } from 'react'
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
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../src/stores/useAuthStore'
import {
  TravelCategory,
  pickTravelImage,
  uploadTravelPhoto,
  createTravelPost,
} from '../src/lib/travel'

const CATEGORIES: { key: TravelCategory; emoji: string; labelKey: string }[] = [
  { key: 'city',    emoji: '🏙️', labelKey: 'travel.filterCity'    },
  { key: 'nature',  emoji: '🌿',  labelKey: 'travel.filterNature'  },
  { key: 'culture', emoji: '⛩️', labelKey: 'travel.filterCulture' },
  { key: 'food',    emoji: '🍜',  labelKey: 'travel.filterFood'    },
]

const SEASON_KEYS = ['spring', 'summer', 'autumn', 'winter'] as const

const COST_LEVELS: { level: 1 | 2 | 3; costKey: string }[] = [
  { level: 1, costKey: 'travel.cost.1' },
  { level: 2, costKey: 'travel.cost.2' },
  { level: 3, costKey: 'travel.cost.3' },
]

const CATEGORY_COLOR: Record<TravelCategory, string> = {
  city: '#6D28D9',
  nature: '#059669',
  culture: '#DC2626',
  food: '#D97706',
}

export default function TravelPostScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()

  const [title, setTitle]           = useState('')
  const [location, setLocation]     = useState('')
  const [description, setDesc]      = useState('')
  const [category, setCategory]     = useState<TravelCategory>('city')
  const [costLevel, setCost]        = useState<1 | 2 | 3>(2)
  const [seasonTags, setSeasons]    = useState<string[]>([])
  const [imageUri, setImageUri]     = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)

  function toggleSeason(key: string) {
    setSeasons((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  async function handlePickImage() {
    try {
      const uri = await pickTravelImage()
      if (uri) setImageUri(uri)
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
      let photoUrl: string | null = null

      if (imageUri) {
        setUploading(true)
        photoUrl = await uploadTravelPhoto(imageUri)
        setUploading(false)
      }

      await createTravelPost({
        title,
        description,
        location,
        category,
        photo_url: photoUrl,
        cost_level: costLevel,
        season_tags: seasonTags,
      })

      setSuccess(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[TravelPost] 投稿エラー:', msg)
      setErrorMsg(msg || t('travel.post.errorDefault'))
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  // 成功画面
  if (success) {
    return (
      <View style={s.wrapper}>
        <View style={s.header}>
          <Text style={s.headerTitle}>✈️ {t('travel.post.title')}</Text>
        </View>
        <View style={s.successBox}>
          <Text style={s.successIcon}>✅</Text>
          <Text style={s.successTitle}>{t('travel.post.successTitle')}</Text>
          <Text style={s.successMsg}>{t('travel.post.successMsg')}</Text>
          <TouchableOpacity style={s.successBtn} onPress={() => router.back()}>
            <Text style={s.successBtnText}>← ホームへ戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={s.wrapper}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Text style={s.closeBtnText}>{t('travel.post.back')}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>✈️ {t('travel.post.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error banner */}
        {errorMsg && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        {/* Photo picker */}
        <TouchableOpacity style={s.photoPicker} onPress={handlePickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.photoPreview} resizeMode="cover" />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoPlaceholderIcon}>📷</Text>
              <Text style={s.photoPlaceholderText}>{t('travel.post.photoHint')}</Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity style={s.removePhoto} onPress={() => setImageUri(null)}>
            <Text style={s.removePhotoText}>{t('travel.post.removePhoto')}</Text>
          </TouchableOpacity>
        )}

        {/* Title */}
        <Text style={s.label}>{t('travel.post.spotName')} <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t('travel.post.spotNamePlaceholder')}
          placeholderTextColor="#bbb"
          maxLength={60}
        />

        {/* Location */}
        <Text style={s.label}>{t('travel.post.locationLabel')} <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          value={location}
          onChangeText={setLocation}
          placeholder={t('travel.post.locationPlaceholder')}
          placeholderTextColor="#bbb"
          maxLength={60}
        />

        {/* Description */}
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

        {/* Category */}
        <Text style={s.label}>{t('travel.post.categoryLabel')}</Text>
        <View style={s.pillRow}>
          {CATEGORIES.map((c) => {
            const active = category === c.key
            return (
              <TouchableOpacity
                key={c.key}
                style={[
                  s.pill,
                  active && { backgroundColor: CATEGORY_COLOR[c.key], borderColor: CATEGORY_COLOR[c.key] },
                ]}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.8}
              >
                <Text style={s.pillEmoji}>{c.emoji}</Text>
                <Text style={[s.pillText, active && s.pillTextActive]}>{t(c.labelKey)}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Cost level */}
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
                <Text style={[s.pillText, active && s.pillTextActive]}>{t(c.costKey)}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Season tags */}
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

        {/* Submit */}
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
                {uploading ? t('travel.post.uploading') : t('travel.post.submit')}
              </Text>
            </View>
          ) : (
            <Text style={s.submitBtnText}>{t('travel.post.submit')}</Text>
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

  photoPicker: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    height: 200,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#DDE3EE',
    borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderIcon: { fontSize: 40 },
  photoPlaceholderText: { fontSize: 14, color: '#aaa', fontWeight: '600' },

  removePhoto: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  removePhotoText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },

  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
    marginTop: 16,
  },
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
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 4,
  },

  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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

  // 成功画面
  successBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
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
