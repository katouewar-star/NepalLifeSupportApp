/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Database } from '@/lib/database.types'

// ── Types ────────────────────────────────────────────────────────────────────

export type PostCategory = 'qa' | 'life' | 'event'

// Mirror DB row shapes as string-ID interfaces for the app layer.
// The database uses numeric IDs; we expose them as strings for component safety.
export interface Post {
  id: string
  user_id: string
  title: string
  body: string
  category: PostCategory
  like_count: number
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

// Raw DB row types (numeric IDs as the schema defines)
type DbPost    = Database['public']['Tables']['posts']['Row']
type DbComment = Database['public']['Tables']['comments']['Row']

// ── Helpers ──────────────────────────────────────────────────────────────────

function requireAuth(): string {
  const { user } = useAuthStore.getState()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user.id
}

function requireNonEmpty(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} must not be empty`)
  }
}

function dbPostToPost(row: DbPost): Post {
  return { ...row, id: String(row.id) }
}

function dbCommentToComment(row: DbComment): Comment {
  return { ...row, id: String(row.id), post_id: String(row.post_id) }
}

// ── fetchPosts ───────────────────────────────────────────────────────────────

/**
 * Fetch posts with optional category filter.
 * Posts are ordered newest first.
 */
export async function fetchPosts(category?: PostCategory): Promise<Post[]> {
  // Use `any` to work around the Supabase generic chain for method chaining;
  // the runtime behaviour is fully tested via the mock suite.
  const query: any = supabase.from('posts').select('*')

  const result = category
    ? await query.eq('category', category).order('created_at', { ascending: false })
    : await query.order('created_at', { ascending: false })

  const { data, error } = result as { data: DbPost[] | null; error: { message: string } | null }
  if (error) throw new Error(error.message)
  return (data ?? []).map(dbPostToPost)
}

// ── createPost ───────────────────────────────────────────────────────────────

/**
 * Create a new post. Requires authentication.
 * Validates that title and body are non-empty.
 */
export async function createPost(params: {
  title: string
  body: string
  category: PostCategory
}): Promise<Post> {
  const userId = requireAuth()
  requireNonEmpty(params.title, 'title')
  requireNonEmpty(params.body, 'body')

  // The Supabase generated Insert type resolves to `never` for these tables
  // due to the typed schema definitions. We cast via `any` here; the runtime
  // behaviour is fully covered by the test suite.
  const { data, error } = await (supabase.from('posts') as any)
    .insert({
      user_id: userId,
      title: params.title,
      body: params.body,
      category: params.category,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbPostToPost(data as DbPost)
}

// ── toggleLike ───────────────────────────────────────────────────────────────

/**
 * Toggle a like on a post. Returns the new liked state.
 * true  = like was added
 * false = like was removed
 */
export async function toggleLike(postId: string): Promise<boolean> {
  const userId = requireAuth()

  // Check if already liked
  const { data: existing, error: checkError } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) throw new Error(checkError.message)

  if (existing) {
    // Unlike: delete the row
    await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    return false
  } else {
    // Like: insert a row
    await (supabase.from('likes') as any).insert({ post_id: postId, user_id: userId })

    return true
  }
}

// ── fetchComments ────────────────────────────────────────────────────────────

/**
 * Fetch all comments for a post, ordered oldest first.
 */
export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as DbComment[]).map(dbCommentToComment)
}

// ── addComment ───────────────────────────────────────────────────────────────

/**
 * Add a comment to a post. Requires authentication.
 * Validates that body is non-empty.
 */
export async function addComment(postId: string, body: string): Promise<Comment> {
  const userId = requireAuth()
  requireNonEmpty(body, 'body')

  const { data, error } = await (supabase.from('comments') as any)
    .insert({
      post_id: postId,
      user_id: userId,
      body: body.trim(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbCommentToComment(data as DbComment)
}
