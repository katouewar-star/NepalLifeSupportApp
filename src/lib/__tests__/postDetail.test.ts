/**
 * postDetail.test.ts
 *
 * TDD RED phase: tests for comment functions (fetchComments / addComment)
 * and the new store actions (loadComments / submitComment).
 *
 * Tests are written BEFORE the store additions so they will fail (RED) until
 * the implementation is added.
 */

import { fetchComments, addComment, type Comment } from '../community'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// ── Mock useAuthStore ─────────────────────────────────────────────────────────
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}))

// ── Mock community lib for store tests ───────────────────────────────────────
jest.mock('@/lib/community', () => ({
  fetchPosts: jest.fn().mockResolvedValue([]),
  createPost: jest.fn(),
  toggleLike: jest.fn(),
  fetchComments: jest.fn().mockResolvedValue([]),
  addComment: jest.fn(),
}))

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import * as communityLib from '@/lib/community'
import { useCommunityStore } from '@/stores/useCommunityStore'

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockGetState = useAuthStore.getState as jest.Mock
const mockFetchComments = communityLib.fetchComments as jest.Mock
const mockAddComment = communityLib.addComment as jest.Mock

// ── Fixtures ──────────────────────────────────────────────────────────────────

const OLDER_COMMENT: Comment = {
  id: '1',
  post_id: '42',
  user_id: 'user-1',
  body: 'First comment',
  created_at: '2026-01-01T08:00:00Z',
}

const NEWER_COMMENT: Comment = {
  id: '2',
  post_id: '42',
  user_id: 'user-2',
  body: 'Second comment',
  created_at: '2026-01-02T09:00:00Z',
}

// ── fetchComments ─────────────────────────────────────────────────────────────

describe('fetchComments – sorted oldest-first', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Restore the real fetchComments implementation for these tests
    ;(communityLib.fetchComments as jest.Mock).mockImplementation(
      jest.requireActual('../community').fetchComments
    )
  })

  it('returns comments in oldest-first order (ascending created_at)', async () => {
    const comments = [OLDER_COMMENT, NEWER_COMMENT]
    const orderMock = jest.fn().mockResolvedValue({ data: comments, error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchComments('42')

    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
  })

  it('returns empty array when the post has no comments', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [], error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchComments('99')
    expect(result).toEqual([])
  })

  it('queries the correct post_id', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [OLDER_COMMENT], error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    await fetchComments('42')
    expect(eqMock).toHaveBeenCalledWith('post_id', '42')
  })

  it('throws when supabase returns an error', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    await expect(fetchComments('42')).rejects.toThrow('DB error')
  })

  it('converts numeric id to string', async () => {
    const rawComment = { id: 5, post_id: 42, user_id: 'u', body: 'hi', created_at: '2026-01-01T00:00:00Z' }
    const orderMock = jest.fn().mockResolvedValue({ data: [rawComment], error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockSupabase.from = jest.fn().mockReturnValue({ select: selectMock })

    const result = await fetchComments('42')
    expect(typeof result[0].id).toBe('string')
    expect(typeof result[0].post_id).toBe('string')
  })
})

// ── addComment ────────────────────────────────────────────────────────────────

describe('addComment – insert with trim', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetState.mockReturnValue({ user: { id: 'user-abc' } })
    // Restore the real addComment implementation for these tests
    ;(communityLib.addComment as jest.Mock).mockImplementation(
      jest.requireActual('../community').addComment
    )
  })

  it('inserts a comment with the body trimmed', async () => {
    const returned: Comment = { ...OLDER_COMMENT, body: 'trimmed body' }
    const singleMock = jest.fn().mockResolvedValue({ data: returned, error: null })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    const result = await addComment('42', '  trimmed body  ')

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'trimmed body' })
    )
    expect(result).toEqual(returned)
  })

  it('throws when body is an empty string', async () => {
    await expect(addComment('42', '')).rejects.toThrow()
  })

  it('throws when body is only whitespace', async () => {
    await expect(addComment('42', '   ')).rejects.toThrow()
  })

  it('throws when user is not authenticated', async () => {
    mockGetState.mockReturnValue({ user: null })
    await expect(addComment('42', 'hello')).rejects.toThrow('Authentication required')
  })

  it('includes the correct post_id and user_id in the insert payload', async () => {
    const returned: Comment = { ...OLDER_COMMENT }
    const singleMock = jest.fn().mockResolvedValue({ data: returned, error: null })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    await addComment('42', 'hello')

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        post_id: '42',
        user_id: 'user-abc',
      })
    )
  })

  it('throws when supabase insert returns an error', async () => {
    const singleMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const selectAfterInsert = jest.fn().mockReturnValue({ single: singleMock })
    const insertMock = jest.fn().mockReturnValue({ select: selectAfterInsert })
    mockSupabase.from = jest.fn().mockReturnValue({ insert: insertMock })

    await expect(addComment('42', 'hello')).rejects.toThrow('Insert failed')
  })
})

// ── Store additions: loadComments / submitComment ─────────────────────────────
// These tests drive the new store state and actions that must be added to
// useCommunityStore. They use the static top-level import which is the module
// already processed via the jest.mock() calls at the top of this file.

describe('useCommunityStore – loadComments / submitComment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store to initial state between tests
    useCommunityStore.setState({
      posts: [],
      loading: false,
      error: null,
      selectedCategory: 'all',
      comments: {},
      commentsLoading: false,
    })
    mockFetchComments.mockResolvedValue([])
    mockAddComment.mockResolvedValue(NEWER_COMMENT)
  })

  it('exposes a comments map on the initial state', () => {
    const state = useCommunityStore.getState()
    expect(state).toHaveProperty('comments')
    expect(state.comments).toEqual({})
  })

  it('exposes commentsLoading flag initialised to false', () => {
    const state = useCommunityStore.getState()
    expect(state).toHaveProperty('commentsLoading')
    expect(state.commentsLoading).toBe(false)
  })

  it('exposes loadComments action', () => {
    expect(typeof useCommunityStore.getState().loadComments).toBe('function')
  })

  it('exposes submitComment action', () => {
    expect(typeof useCommunityStore.getState().submitComment).toBe('function')
  })

  it('loadComments sets commentsLoading to false after resolution', async () => {
    mockFetchComments.mockResolvedValue([])
    await useCommunityStore.getState().loadComments('42')
    expect(useCommunityStore.getState().commentsLoading).toBe(false)
  })

  it('loadComments stores fetched comments under the postId key', async () => {
    const mockComments: Comment[] = [OLDER_COMMENT, NEWER_COMMENT]
    mockFetchComments.mockResolvedValue(mockComments)

    await useCommunityStore.getState().loadComments('42')

    expect(useCommunityStore.getState().comments['42']).toEqual(mockComments)
  })

  it('loadComments calls fetchComments with the given postId', async () => {
    await useCommunityStore.getState().loadComments('42')
    expect(mockFetchComments).toHaveBeenCalledWith('42')
  })

  it('submitComment appends a new comment to the correct postId bucket', async () => {
    // Seed existing comment
    mockFetchComments.mockResolvedValue([OLDER_COMMENT])
    await useCommunityStore.getState().loadComments('42')

    const newComment: Comment = { ...NEWER_COMMENT, id: '99' }
    mockAddComment.mockResolvedValue(newComment)
    await useCommunityStore.getState().submitComment('42', 'Second comment')

    const state = useCommunityStore.getState()
    expect(state.comments['42']).toHaveLength(2)
    expect(state.comments['42'][1]).toEqual(newComment)
  })

  it('submitComment calls addComment with the correct postId and body', async () => {
    await useCommunityStore.getState().submitComment('42', 'hello world')
    expect(mockAddComment).toHaveBeenCalledWith('42', 'hello world')
  })

  it('submitComment initialises the bucket if it does not exist yet', async () => {
    const newComment: Comment = { ...NEWER_COMMENT }
    mockAddComment.mockResolvedValue(newComment)

    await useCommunityStore.getState().submitComment('99', 'first!')

    expect(useCommunityStore.getState().comments['99']).toEqual([newComment])
  })
})
