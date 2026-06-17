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
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
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

const SEASONS = [
  { key: 'spring', label: '春 🌸' },
  { key: 'summer', label: '夏 ☀️' },
  { key: 'autumn', label: '秋 🍂' },
  { key: 'winter', label: '冬 ❄️' },
]

const COST_LEVELS: { level: 1 | 2 | 3; label: string }[] = [
  { level: 1, label: '💴 格安'   },
  { level: 2, label: '💴💴 普通'  },
  { level: 3, label: '💴💴💴 高め' },
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

  const [title, setTitle]           = useState('')
  const [location, setLocation]     = useState('')
  const [description, setDesc]      = useState('')
  const [category, setCategory]     = useState<TravelCategory>('city')
  const [costLevel, setCost]        = useState<1 | 2 | 3>(2)
  const [seasonTags, setSeasons]    = useState<string[]>([])
  const [imageUri, setImageUri]     = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
      Alert.alert('エラー', e instanceof Error ? e.message : '画像の選択に失敗しました')
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !location.trim() || !description.trim()) {
      Alert.alert('入力エラー', 'タイトル・場所・説明は必須です')
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

      Alert.alert('投稿完了', 'スポットを投稿しました！', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (e: unknown) {
      Alert.alert('エラー', e instanceof Error ? e.message : '投稿に失敗しました')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <View style={s.wrapper}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <Text style={s.closeBtnText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>✈️ スポットを投稿</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo picker */}
        <TouchableOpacity style={s.photoPicker} onPress={handlePickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.photoPreview} resizeMode="cover" />
          ) : (
            <View style={s.photoPlaceholder}>
              <Text style={s.photoPlaceholderIcon}>📷</Text>
              <Text style={s.photoPlaceholderText}>写真を選ぶ（1枚）</Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity style={s.removePhoto} onPress={() => setImageUri(null)}>
            <Text style={s.removePhotoText}>✕ 写真を削除</Text>
          </TouchableOpacity>
        )}

        {/* Title */}
        <Text style={s.label}>スポット名 <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="例: 新宿御苑"
          placeholderTextColor="#bbb"
          maxLength={60}
        />

        {/* Location */}
        <Text style={s.label}>場所・都道府県 <Text style={s.required}>*</Text></Text>
        <TextInput
          style={s.input}
          value={location}
          onChangeText={setLocation}
          placeholder="例: 東京都新宿区"
          placeholderTextColor="#bbb"
          maxLength={60}
        />

        {/* Description */}
        <Text style={s.label}>紹介文 <Text style={s.required}>*</Text></Text>
        <TextInput
          style={[s.input, s.textarea]}
          value={description}
          onChangeText={setDesc}
          placeholder="このスポットの魅力を教えてください"
          placeholderTextColor="#bbb"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        <Text style={s.charCount}>{description.length} / 500</Text>

        {/* Category */}
        <Text style={s.label}>カテゴリ</Text>
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
        <Text style={s.label}>費用目安</Text>
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
                <Text style={[s.pillText, active && s.pillTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Season tags */}
        <Text style={s.label}>おすすめ季節（複数可）</Text>
        <View style={s.pillRow}>
          {SEASONS.map((s_) => {
            const active = seasonTags.includes(s_.key)
            return (
              <TouchableOpacity
                key={s_.key}
                style={[s.pill, active && s.pillActive]}
                onPress={() => toggleSeason(s_.key)}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{s_.label}</Text>
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.submitBtnText}>
              {uploading ? '画像アップロード中...' : '投稿する'}
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
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
