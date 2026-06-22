/**
 * community.ts - TDD test suite
 *
 * Tests are written FIRST (RED phase).
 * Supabase client is fully mocked so no network is required.
 */

import {
  fetchPosts,
  createPost,
  toggleLike,
  fetchComments,
  addComment,
  POSTS_PAGE_SIZE,
  type Post,
  type Comment,
  type PostCategory,
} from '../community'

// ── Mock Supabase ────────────────────────────────────────────────────────────
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}))

// ── Mock useAuthStore ────────────────────────────────────────────────────────
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}))

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockGetState = useAuthStore.getState as jest.Mock

// ── Shared fixtures ──────────────────────────────────────────────────────────
const MOCK_POST: Post = {
  id: '1',
  user_id: 'user-abc',
  title: 'Test Post',
  body: 'Body text here',
  category: 'qa',
  like_count: 3,
  created_at: '2026-01-01T00:00:00Z',
}

const MOCK_COMMENT: Comment = {
  id: '10',
  post_id: '1',
  user_id: 'user-abc',
  body: 'Nice post!',
  created_at: '2026-01-02T00:00:00Z',
}

// ── fetchPosts ───────────────────────────────────────────────────────────────
describe('fetchPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns all posts when no category filter is provided', async () => {
    const posts = [MOCK_POST, { ...MOCK_POST, id: '2', category: 'life' as PostCategory }]
    const rangeMock = jest.fn().mockResolvedValue({ data: posts, error: null })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ order: orderMock, eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchPosts()

    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(selectMock).toHaveBeenCalled()
    expect(rangeMock).toHaveBeenCalledWith(0, POSTS_PAGE_SIZE - 1)
    expect(result).toEqual(posts)
  })

  it('filters posts by category when category is provided', async () => {
    const filteredPosts = [MOCK_POST]
    const rangeMock = jest.fn().mockResolvedValue({ data: filteredPosts, error: null })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock, order: orderMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchPosts('qa')

    expect(eqMock).toHaveBeenCalledWith('category', 'qa')
    expect(result).toEqual(filteredPosts)
  })

  it('returns empty array when no posts exist', async () => {
    const rangeMock = jest.fn().mockResolvedValue({ data: [], error: null })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ order: orderMock, eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchPosts()

    expect(result).toEqual([])
  })

  it('throws an error when supabase returns an error', async () => {
    const rangeMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const selectMock = jest.fn().mockReturnValue({ order: orderMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    await expect(fetchPosts()).rejects.toThrow('DB error')
  })

  it('fetches the correct page range for page 1', async () => {
    const rangeMock = jest.fn().mockResolvedValue({ data: [], error: null })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const selectMock = jest.fn().mockReturnValue({ order: orderMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    await fetchPosts(undefined, 1)

    expect(rangeMock).toHaveBeenCalledWith(POSTS_PAGE_SIZE, POSTS_PAGE_SIZE * 2 - 1)
  })

  it('filters by each valid category: life', async () => {
    const lifePosts = [{ ...MOCK_POST, id: '3', category: 'life' as PostCategory }]
    const rangeMock = jest.fn().mockResolvedValue({ data: lifePosts, error: null })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock, order: orderMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchPosts('life')

    expect(eqMock).toHaveBeenCalledWith('category', 'life')
    expect(result).toEqual(lifePosts)
  })

  it('filters by each valid category: event', async () => {
    const eventPosts = [{ ...MOCK_POST, id: '4', category: 'event' as PostCategory }]
    const rangeMock = jest.fn().mockResolvedValue({ data: eventPosts, error: null })
    const orderMock = jest.fn().mockReturnValue({ range: rangeMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock, order: orderMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchPosts('event')

    expect(eqMock).toHaveBeenCalledWith('category', 'event')
    expect(result).toEqual(eventPosts)
  })
})

// ── createPost ───────────────────────────────────────────────────────────────
describe('createPost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetState.mockReturnValue({ user: { id: 'user-abc' } })
  })

  it('creates a post and returns the created post', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: MOCK_POST, error: null })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    const result = await createPost({ title: 'Test Post', body: 'Body text here', category: 'qa' })

    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Post',
        body: 'Body text here',
        category: 'qa',
        user_id: 'user-abc',
      })
    )
    expect(result).toEqual(MOCK_POST)
  })

  it('throws when user is not authenticated', async () => {
    mockGetState.mockReturnValue({ user: null })

    await expect(
      createPost({ title: 'Test', body: 'Body', category: 'qa' })
    ).rejects.toThrow()
  })

  it('throws when supabase insert returns an error', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    await expect(
      createPost({ title: 'Test', body: 'Body', category: 'qa' })
    ).rejects.toThrow('Insert failed')
  })

  it('throws when title is empty string', async () => {
    await expect(
      createPost({ title: '', body: 'Body', category: 'qa' })
    ).rejects.toThrow()
  })

  it('throws when body is empty string', async () => {
    await expect(
      createPost({ title: 'Title', body: '', category: 'qa' })
    ).rejects.toThrow()
  })
})

// ── toggleLike ───────────────────────────────────────────────────────────────
describe('toggleLike', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetState.mockReturnValue({ user: { id: 'user-abc' } })
  })

  it('inserts a like and returns true when post is not yet liked', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    const result = await toggleLike('1')

    expect(result).toBe(true)
    expect(insertMock).toHaveBeenCalledWith({ post_id: 1, user_id: 'user-abc' })
  })

  it('deletes a like and returns false when post is already liked', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } })
    const eqUserMock = jest.fn().mockResolvedValue({ error: null })
    const eqPostMock = jest.fn().mockReturnValue({ eq: eqUserMock })
    const deleteMock = jest.fn().mockReturnValue({ eq: eqPostMock })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock, delete: deleteMock })

    const result = await toggleLike('1')

    expect(result).toBe(false)
    expect(deleteMock).toHaveBeenCalled()
  })

  it('throws when user is not authenticated', async () => {
    mockGetState.mockReturnValue({ user: null })

    await expect(toggleLike('1')).rejects.toThrow()
  })

  it('throws when INSERT returns a non-unique-constraint error', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: { code: '42P01', message: 'Query failed' } })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    await expect(toggleLike('1')).rejects.toThrow('Query failed')
  })
})

// ── fetchComments ────────────────────────────────────────────────────────────
describe('fetchComments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns comments for a given post id', async () => {
    const comments = [MOCK_COMMENT]
    const orderMock = jest.fn().mockResolvedValue({ data: comments, error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchComments('1')

    expect(mockSupabase.from).toHaveBeenCalledWith('comments')
    expect(result).toEqual(comments)
  })

  it('returns empty array when post has no comments', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [], error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchComments('999')

    expect(result).toEqual([])
  })

  it('throws when supabase returns an error', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Comments error' } })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    await expect(fetchComments('1')).rejects.toThrow('Comments error')
  })

  it('orders comments ascending by created_at', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [MOCK_COMMENT], error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    await fetchComments('1')

    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: true })
  })
})

// ── addComment ───────────────────────────────────────────────────────────────
describe('addComment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetState.mockReturnValue({ user: { id: 'user-abc' } })
  })

  it('inserts a comment and returns it', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: MOCK_COMMENT, error: null })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    const result = await addComment('1', 'Nice post!')

    expect(mockSupabase.from).toHaveBeenCalledWith('comments')
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        post_id: '1',
        body: 'Nice post!',
        user_id: 'user-abc',
      })
    )
    expect(result).toEqual(MOCK_COMMENT)
  })

  it('throws when user is not authenticated', async () => {
    mockGetState.mockReturnValue({ user: null })

    await expect(addComment('1', 'Hello')).rejects.toThrow()
  })

  it('throws when comment body is empty', async () => {
    await expect(addComment('1', '')).rejects.toThrow()
  })

  it('throws when supabase insert returns an error', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    await expect(addComment('1', 'Hello')).rejects.toThrow('Insert failed')
  })

  it('throws when comment body is only whitespace', async () => {
    await expect(addComment('1', '   ')).rejects.toThrow()
  })
})
