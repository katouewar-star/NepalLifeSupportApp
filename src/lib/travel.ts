import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import type { Database } from '@/lib/database.types'

export type TravelCategory = 'city' | 'nature' | 'culture' | 'food'

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter'

export type DurationKey = 'one' | 'oneTwo' | 'twoThree' | 'threeFour' | 'threeFive'

export type AccessKey =
  | 'local'
  | 'shinkansen215'
  | 'shinkansen230'
  | 'shinkansen240'
  | 'shinkansen300'
  | 'plane90'
  | 'plane150'
  | 'train90'

const CDN = 'https://images.unsplash.com/photo-'
const Q   = '?w=800&q=85&auto=format&fit=crop'

export interface TravelDestination {
  id: string
  category: TravelCategory
  emoji: string
  costLevel: 1 | 2 | 3
  durationKey: DurationKey
  accessKey: AccessKey
  seasonKeys: SeasonKey[]
  highlightKeys: [string, string, string, string]
  /** Unsplash CDN photo URL */
  photoUrl: string
  /** Number of plan days available in translation files */
  planDayCount: number
}

export const DESTINATIONS: TravelDestination[] = [
  {
    id: 'tokyo',
    category: 'city',
    emoji: '🗼',
    costLevel: 2,
    durationKey: 'twoThree',
    accessKey: 'local',
    seasonKeys: ['spring', 'summer', 'autumn', 'winter'],
    highlightKeys: ['shinjuku', 'asakusa', 'shibuya', 'akihabara'],
    photoUrl: CDN + '1540959733332-eab4deabeeaf' + Q,
    planDayCount: 3,
  },
  {
    id: 'kyoto',
    category: 'culture',
    emoji: '⛩️',
    costLevel: 2,
    durationKey: 'twoThree',
    accessKey: 'shinkansen215',
    seasonKeys: ['spring', 'autumn'],
    highlightKeys: ['fushimi', 'kinkakuji', 'arashiyama', 'gion'],
    photoUrl: CDN + '1493976040374-85c8e12f0c0e' + Q,
    planDayCount: 3,
  },
  {
    id: 'osaka',
    category: 'food',
    emoji: '🍜',
    costLevel: 2,
    durationKey: 'oneTwo',
    accessKey: 'shinkansen230',
    seasonKeys: ['spring', 'summer', 'autumn', 'winter'],
    highlightKeys: ['dotonbori', 'castle', 'kuromon', 'namba'],
    photoUrl: CDN + '1589452271712-64b8a66c7b71' + Q,
    planDayCount: 2,
  },
  {
    id: 'hokkaido',
    category: 'nature',
    emoji: '🏔️',
    costLevel: 3,
    durationKey: 'threeFive',
    accessKey: 'plane90',
    seasonKeys: ['summer', 'winter'],
    highlightKeys: ['sapporo', 'furano', 'otaru', 'niseko'],
    photoUrl: CDN + '1553361371-9b22f78e8b1d' + Q,
    planDayCount: 3,
  },
  {
    id: 'fuji',
    category: 'nature',
    emoji: '🗻',
    costLevel: 2,
    durationKey: 'oneTwo',
    accessKey: 'train90',
    seasonKeys: ['spring', 'summer', 'autumn'],
    highlightKeys: ['climb', 'hakone', 'kawaguchiko', 'onsen'],
    photoUrl: CDN + '1490806843957-31f4c9a91c65' + Q,
    planDayCount: 1,
  },
  {
    id: 'nara',
    category: 'culture',
    emoji: '🦌',
    costLevel: 1,
    durationKey: 'one',
    accessKey: 'shinkansen300',
    seasonKeys: ['spring', 'autumn'],
    highlightKeys: ['deer', 'todaiji', 'kasuga', 'naramachi'],
    photoUrl: CDN + '1524413840807-0c3cb6fa808d' + Q,
    planDayCount: 1,
  },
  {
    id: 'hiroshima',
    category: 'culture',
    emoji: '🕊️',
    costLevel: 2,
    durationKey: 'oneTwo',
    accessKey: 'shinkansen240',
    seasonKeys: ['spring', 'autumn'],
    highlightKeys: ['peace', 'miyajima', 'okonomiyaki', 'itsukushima'],
    photoUrl: CDN + '1528360983277-13d401cdc186' + Q,
    planDayCount: 2,
  },
  {
    id: 'okinawa',
    category: 'nature',
    emoji: '🏖️',
    costLevel: 3,
    durationKey: 'threeFour',
    accessKey: 'plane150',
    seasonKeys: ['spring', 'summer'],
    highlightKeys: ['beach', 'snorkel', 'ryukyu', 'churaumi'],
    photoUrl: CDN + '1510414842594-a61c69b5ae57' + Q,
    planDayCount: 2,
  },
]

export function filterDestinations(
  list: TravelDestination[],
  category: 'all' | TravelCategory
): TravelDestination[] {
  return category === 'all' ? list : list.filter((d) => d.category === category)
}

// ── UGC travel posts ──────────────────────────────────────────────────────

type DbTravelPost = Database['public']['Tables']['travel_posts']['Row']

export interface TravelPost {
  id: string
  user_id: string
  author_name: string | null
  title: string
  description: string
  location: string
  category: TravelCategory
  photo_url: string | null
  photo_urls: string[]
  cost_level: 1 | 2 | 3 | null
  season_tags: string[]
  highlights: string[]
  highlight_photos: string[]
  tips: string | null
  access_info: string | null
  duration_key: string | null
  external_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  like_count: number
  created_at: string
}

function dbToTravelPost(row: DbTravelPost): TravelPost {
  return {
    ...row,
    id: String(row.id),
    author_name: row.author_name ?? null,
    photo_urls: row.photo_urls ?? (row.photo_url ? [row.photo_url] : []),
    season_tags: row.season_tags ?? [],
    highlights: row.highlights ?? [],
    highlight_photos: row.highlight_photos ?? [],
    external_url: row.external_url ?? null,
  }
}

function requireAuth(): string {
  const { user } = useAuthStore.getState()
  if (!user) throw new Error('Authentication required')
  return user.id
}

/** Fetch all approved travel posts, newest first */
export async function fetchTravelPosts(
  category?: TravelCategory
): Promise<TravelPost[]> {
  let query = supabase
    .from('travel_posts')
    .select('*')
    .eq('status', 'approved')

  if (category) query = query.eq('category', category)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToTravelPost)
}

/** Max long-edge (px) and JPEG quality used to shrink images before upload */
const UPLOAD_MAX_EDGE = 1280
const UPLOAD_QUALITY = 0.7

/**
 * Resize (long edge → UPLOAD_MAX_EDGE) and re-encode an image as JPEG before
 * upload. Phone gallery photos are often 3–8 MB at full resolution; this
 * typically reduces them by ~10×, which is the main fix for slow uploads.
 */
async function compressForUpload(imageUri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: UPLOAD_MAX_EDGE } }],
      { compress: UPLOAD_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
    )
    return result.uri
  } catch {
    // Manipulation failed (e.g. unsupported format) — fall back to original
    return imageUri
  }
}

/**
 * Max photos compressed+uploaded at once. Each upload decodes/resizes/re-encodes
 * a full-res image via canvas, and mobile browsers (esp. iOS Safari) have a hard
 * canvas/decode memory limit. Processing every photo in parallel (up to 9 at once)
 * exhausts that memory and makes uploads hang and never finish. Cap concurrency so
 * only a few run at a time; the rest queue and start as slots free up.
 */
const UPLOAD_CONCURRENCY = 2

let activeUploads = 0
const uploadWaiters: Array<() => void> = []

function acquireUploadSlot(): Promise<void> {
  if (activeUploads < UPLOAD_CONCURRENCY) {
    activeUploads++
    return Promise.resolve()
  }
  return new Promise((resolve) => uploadWaiters.push(resolve))
}

function releaseUploadSlot(): void {
  const next = uploadWaiters.shift()
  // Hand the just-freed slot to the next waiter (activeUploads stays the same),
  // or reclaim it if no one is waiting.
  if (next) next()
  else activeUploads--
}

/** Upload a photo to Supabase Storage and return the public URL */
export async function uploadTravelPhoto(
  imageUri: string
): Promise<string> {
  const userId = requireAuth()

  await acquireUploadSlot()
  try {
    const compressedUri = await compressForUpload(imageUri)
    const response = await fetch(compressedUri)
    const blob = await response.blob()

    // Always JPEG after compression; fall back to blob.type if unchanged
    const mimeType = blob.type || 'image/jpeg'
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    // Random suffix avoids path collisions when two uploads share a millisecond
    const rand = Math.random().toString(36).slice(2, 8)
    const path = `${userId}/${Date.now()}-${rand}.${ext}`

    const { error } = await supabase.storage
      .from('travel-photos')
      .upload(path, blob, { contentType: mimeType, upsert: false })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('travel-photos').getPublicUrl(path)
    return data.publicUrl
  } finally {
    releaseUploadSlot()
  }
}

/** Pick a single image. Returns uri or null if cancelled. */
export async function pickTravelImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') throw new Error('Gallery permission denied')

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  })

  if (result.canceled) return null
  return result.assets[0].uri
}

/** Pick multiple images (up to maxCount). Returns uri array. */
export async function pickTravelImages(maxCount = 5): Promise<string[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') throw new Error('Gallery permission denied')

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.8,
    selectionLimit: maxCount,
  })

  if (result.canceled) return []
  return result.assets.map((a) => a.uri)
}

/** Upload multiple photos and return public URL array */
export async function uploadTravelPhotos(imageUris: string[]): Promise<string[]> {
  return Promise.all(imageUris.map((uri) => uploadTravelPhoto(uri)))
}

export type TravelPostParams = {
  title: string
  description: string
  location: string
  category: TravelCategory
  photo_urls: string[]
  cost_level: 1 | 2 | 3 | null
  season_tags: string[]
  highlights: string[]
  highlight_photos: string[]
  tips: string | null
  access_info: string | null
  duration_key: string | null
  external_url: string | null
}

/** Create a new travel post */
export async function createTravelPost(params: TravelPostParams & { author_name?: string | null }): Promise<TravelPost> {
  const userId = requireAuth()

  if (!params.title.trim()) throw new Error('title must not be empty')
  if (!params.description.trim()) throw new Error('description must not be empty')
  if (!params.location.trim()) throw new Error('location must not be empty')

  const { data, error } = await supabase
    .from('travel_posts')
    .insert({
      user_id: userId,
      author_name: params.author_name ?? null,
      title: params.title.trim(),
      description: params.description.trim(),
      location: params.location.trim(),
      category: params.category,
      photo_urls: params.photo_urls,
      photo_url: params.photo_urls[0] ?? null,
      cost_level: params.cost_level,
      season_tags: params.season_tags,
      highlights: params.highlights.filter(Boolean),
      highlight_photos: params.highlight_photos,
      tips: params.tips || null,
      access_info: params.access_info || null,
      duration_key: params.duration_key || null,
      external_url: params.external_url || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbToTravelPost(data)
}

/** Delete own travel post */
export async function deleteTravelPost(postId: string): Promise<void> {
  const userId = requireAuth()
  const { error } = await supabase
    .from('travel_posts')
    .delete()
    .eq('id', Number(postId))
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

/** Delete any travel post (admin only — RLS enforces this) */
export async function adminDeleteTravelPost(postId: string): Promise<void> {
  requireAuth()
  const { error } = await supabase
    .from('travel_posts')
    .delete()
    .eq('id', Number(postId))
  if (error) throw new Error(error.message)
}

/** Update a travel post (owner or admin — RLS enforces this) */
export async function updateTravelPost(
  postId: string,
  params: TravelPostParams
): Promise<TravelPost> {
  requireAuth()
  const { data, error } = await supabase
    .from('travel_posts')
    .update({
      title: params.title.trim(),
      description: params.description.trim(),
      location: params.location.trim(),
      category: params.category,
      photo_urls: params.photo_urls,
      photo_url: params.photo_urls[0] ?? null,
      cost_level: params.cost_level,
      season_tags: params.season_tags,
      highlights: params.highlights.filter(Boolean),
      highlight_photos: params.highlight_photos,
      tips: params.tips || null,
      access_info: params.access_info || null,
      duration_key: params.duration_key || null,
      external_url: params.external_url || null,
    })
    .eq('id', Number(postId))
    .select()
    .single()
  if (error) throw new Error(error.message)
  return dbToTravelPost(data)
}

/** Fetch a single travel post by ID */
export async function fetchTravelPost(postId: string): Promise<TravelPost> {
  const { data, error } = await supabase
    .from('travel_posts')
    .select('*')
    .eq('id', Number(postId))
    .single()
  if (error) throw new Error(error.message)
  return dbToTravelPost(data)
}
