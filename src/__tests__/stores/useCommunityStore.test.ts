/**
 * useCommunityStore.test.ts
 *
 * Unit tests for the Zustand community store covering all actions:
 * loadPosts, setCategory, addPost, likePost, loadComments, submitComment.
 *
 * The community lib is fully mocked so no Supabase or auth calls are made.
 */

// ── Mocks must be declared before any imports that resolve the mocked modules ─
jest.mock('@/lib/community', () => ({
  fetchPosts:     jest.fn().mockResolvedValue([]),
  createPost:     jest.fn(),
  toggleLike:     jest.fn(),
  fetchComments:  jest.fn().mockResolvedValue([]),
  addComment:     jest.fn(),
}))

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: { getState: jest.fn() },
}))

import * as communityLib from '@/lib/community'
import { useCommunityStore } from '@/stores/useCommunityStore'
import type { Post, Comment } from '@/lib/community'

// Typed mock helpers
const mockFetchPosts     = communityLib.fetchPosts     as jest.Mock
const mockCreatePost     = communityLib.createPost     as jest.Mock
const mockToggleLike     = communityLib.toggleLike     as jest.Mock
const mockFetchComments  = communityLib.fetchComments  as jest.Mock
const mockAddComment     = communityLib.addComment     as jest.Mock

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_POST: Post = {
  id: '1',
  user_id: 'user-abc',
  title: 'Test Post',
  body: 'Body text',
  category: 'qa',
  like_count: 2,
  created_at: '2026-01-01T00:00:00Z',
}

const MOCK_COMMENT: Comment = {
  id: '10',
  post_id: '1',
  user_id: 'user-abc',
  body: 'Nice post!',
  created_at: '2026-01-02T00:00:00Z',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Reset the store to its initial values between tests. */
function resetStore() {
  useCommunityStore.setState({
    posts:            [],
    loading:          false,
    error:            null,
    selectedCategory: 'all',
    comments:         {},
    commentsLoading:  false,
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  resetStore()
})

// ── initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has empty posts array', () => {
    expect(useCommunityStore.getState().posts).toEqual([])
  })

  it('has loading = false', () => {
    expect(useCommunityStore.getState().loading).toBe(false)
  })

  it('has error = null', () => {
    expect(useCommunityStore.getState().error).toBeNull()
  })

  it('has selectedCategory = all', () => {
    expect(useCommunityStore.getState().selectedCategory).toBe('all')
  })

  it('has comments = {}', () => {
    expect(useCommunityStore.getState().comments).toEqual({})
  })

  it('has commentsLoading = false', () => {
    expect(useCommunityStore.getState().commentsLoading).toBe(false)
  })
})

// ── loadPosts ─────────────────────────────────────────────────────────────────

describe('loadPosts', () => {
  it('fetches posts and stores them', async () => {
    mockFetchPosts.mockResolvedValue([MOCK_POST])
    await useCommunityStore.getState().loadPosts()
    expect(useCommunityStore.getState().posts).toEqual([MOCK_POST])
  })

  it('sets loading false after success', async () => {
    mockFetchPosts.mockResolvedValue([])
    await useCommunityStore.getState().loadPosts()
    expect(useCommunityStore.getState().loading).toBe(false)
  })

  it('passes category filter to fetchPosts', async () => {
    mockFetchPosts.mockResolvedValue([])
    await useCommunityStore.getState().loadPosts('qa')
    expect(mockFetchPosts).toHaveBeenCalledWith('qa')
  })

  it('sets error on failure and loading stays false', async () => {
    mockFetchPosts.mockRejectedValue(new Error('fetch failed'))
    await useCommunityStore.getState().loadPosts()
    expect(useCommunityStore.getState().error).toBe('fetch failed')
    expect(useCommunityStore.getState().loading).toBe(false)
  })

  it('clears error before each successful load', async () => {
    useCommunityStore.setState({ error: 'old error' })
    mockFetchPosts.mockResolvedValue([])
    await useCommunityStore.getState().loadPosts()
    expect(useCommunityStore.getState().error).toBeNull()
  })
})

// ── setCategory ───────────────────────────────────────────────────────────────

describe('setCategory', () => {
  it('updates selectedCategory', () => {
    useCommunityStore.getState().setCategory('life')
    expect(useCommunityStore.getState().selectedCategory).toBe('life')
  })

  it('triggers a loadPosts call with the new category', () => {
    mockFetchPosts.mockResolvedValue([])
    useCommunityStore.getState().setCategory('event')
    expect(mockFetchPosts).toHaveBeenCalledWith('event')
  })

  it('calls loadPosts with undefined when category is all', () => {
    mockFetchPosts.mockResolvedValue([])
    useCommunityStore.getState().setCategory('all')
    expect(mockFetchPosts).toHaveBeenCalledWith(undefined)
  })
})

// ── addPost ───────────────────────────────────────────────────────────────────

describe('addPost', () => {
  it('prepends the new post to the posts list', async () => {
    const existing: Post = { ...MOCK_POST, id: '0', title: 'existing' }
    useCommunityStore.setState({ posts: [existing] })

    const created: Post = { ...MOCK_POST, id: '2', title: 'new post' }
    mockCreatePost.mockResolvedValue(created)

    await useCommunityStore.getState().addPost({ title: 'new post', body: 'body', category: 'qa' })

    const posts = useCommunityStore.getState().posts
    expect(posts[0]).toEqual(created)
    expect(posts[1]).toEqual(existing)
  })

  it('sets loading false after success', async () => {
    mockCreatePost.mockResolvedValue(MOCK_POST)
    await useCommunityStore.getState().addPost({ title: 'T', body: 'B', category: 'qa' })
    expect(useCommunityStore.getState().loading).toBe(false)
  })

  it('throws and stores error on failure', async () => {
    mockCreatePost.mockRejectedValue(new Error('create failed'))
    await expect(
      useCommunityStore.getState().addPost({ title: 'T', body: 'B', category: 'qa' })
    ).rejects.toThrow('create failed')
    expect(useCommunityStore.getState().error).toBe('create failed')
  })
})

// ── likePost ──────────────────────────────────────────────────────────────────

describe('likePost', () => {
  beforeEach(() => {
    useCommunityStore.setState({ posts: [MOCK_POST] })
  })

  it('increments like_count when liked is true', async () => {
    mockToggleLike.mockResolvedValue(true)
    await useCommunityStore.getState().likePost('1')
    expect(useCommunityStore.getState().posts[0].like_count).toBe(3)
  })

  it('decrements like_count when liked is false', async () => {
    mockToggleLike.mockResolvedValue(false)
    await useCommunityStore.getState().likePost('1')
    expect(useCommunityStore.getState().posts[0].like_count).toBe(1)
  })

  it('does not go below 0 on decrement', async () => {
    useCommunityStore.setState({ posts: [{ ...MOCK_POST, like_count: 0 }] })
    mockToggleLike.mockResolvedValue(false)
    await useCommunityStore.getState().likePost('1')
    expect(useCommunityStore.getState().posts[0].like_count).toBe(0)
  })

  it('stores error and throws on failure', async () => {
    mockToggleLike.mockRejectedValue(new Error('like failed'))
    await expect(useCommunityStore.getState().likePost('1')).rejects.toThrow('like failed')
    expect(useCommunityStore.getState().error).toBe('like failed')
  })
})

// ── loadComments ──────────────────────────────────────────────────────────────

describe('loadComments', () => {
  it('calls fetchComments with the given postId', async () => {
    await useCommunityStore.getState().loadComments('42')
    expect(mockFetchComments).toHaveBeenCalledWith('42')
  })

  it('stores fetched comments under the postId key', async () => {
    mockFetchComments.mockResolvedValue([MOCK_COMMENT])
    await useCommunityStore.getState().loadComments('1')
    expect(useCommunityStore.getState().comments['1']).toEqual([MOCK_COMMENT])
  })

  it('sets commentsLoading to false after success', async () => {
    await useCommunityStore.getState().loadComments('1')
    expect(useCommunityStore.getState().commentsLoading).toBe(false)
  })

  it('sets commentsLoading to false and rethrows on error', async () => {
    mockFetchComments.mockRejectedValue(new Error('load error'))
    await expect(useCommunityStore.getState().loadComments('1')).rejects.toThrow('load error')
    expect(useCommunityStore.getState().commentsLoading).toBe(false)
  })

  it('does not overwrite comments for other posts', async () => {
    useCommunityStore.setState({ comments: { '99': [MOCK_COMMENT] } })
    mockFetchComments.mockResolvedValue([])
    await useCommunityStore.getState().loadComments('1')
    expect(useCommunityStore.getState().comments['99']).toEqual([MOCK_COMMENT])
  })
})

// ── submitComment ─────────────────────────────────────────────────────────────

describe('submitComment', () => {
  it('calls addComment with the correct args', async () => {
    mockAddComment.mockResolvedValue(MOCK_COMMENT)
    await useCommunityStore.getState().submitComment('1', 'hello')
    expect(mockAddComment).toHaveBeenCalledWith('1', 'hello')
  })

  it('appends the new comment to an existing bucket', async () => {
    useCommunityStore.setState({ comments: { '1': [MOCK_COMMENT] } })
    const second: Comment = { ...MOCK_COMMENT, id: '11', body: 'second' }
    mockAddComment.mockResolvedValue(second)
    await useCommunityStore.getState().submitComment('1', 'second')
    expect(useCommunityStore.getState().comments['1']).toHaveLength(2)
    expect(useCommunityStore.getState().comments['1'][1]).toEqual(second)
  })

  it('creates a new bucket when none exists', async () => {
    mockAddComment.mockResolvedValue(MOCK_COMMENT)
    await useCommunityStore.getState().submitComment('42', 'first!')
    expect(useCommunityStore.getState().comments['42']).toEqual([MOCK_COMMENT])
  })

  it('throws if addComment rejects', async () => {
    mockAddComment.mockRejectedValue(new Error('add failed'))
    await expect(useCommunityStore.getState().submitComment('1', 'text')).rejects.toThrow('add failed')
  })
})

// ── non-Error rejection branches (coverage) ───────────────────────────────────

describe('non-Error rejection handling', () => {
  it('loadPosts stores "Unknown error" when a non-Error is thrown', async () => {
    mockFetchPosts.mockRejectedValue('plain string error')
    await useCommunityStore.getState().loadPosts()
    expect(useCommunityStore.getState().error).toBe('Unknown error')
  })

  it('addPost stores "Unknown error" when a non-Error is thrown', async () => {
    mockCreatePost.mockRejectedValue('plain string error')
    await expect(
      useCommunityStore.getState().addPost({ title: 'T', body: 'B', category: 'qa' })
    ).rejects.toBe('plain string error')
    expect(useCommunityStore.getState().error).toBe('Unknown error')
  })

  it('likePost stores "Unknown error" when a non-Error is thrown', async () => {
    useCommunityStore.setState({ posts: [MOCK_POST] })
    mockToggleLike.mockRejectedValue('plain string error')
    await expect(useCommunityStore.getState().likePost('1')).rejects.toBe('plain string error')
    expect(useCommunityStore.getState().error).toBe('Unknown error')
  })

  it('loadComments stores "Unknown error" when a non-Error is thrown', async () => {
    mockFetchComments.mockRejectedValue('plain string error')
    await expect(useCommunityStore.getState().loadComments('1')).rejects.toBe('plain string error')
    expect(useCommunityStore.getState().error).toBe('Unknown error')
  })
})

// ── likePost: post not found in list ─────────────────────────────────────────

describe('likePost – post id not in posts list', () => {
  it('leaves the posts array unchanged when the id does not match', async () => {
    useCommunityStore.setState({ posts: [MOCK_POST] })
    mockToggleLike.mockResolvedValue(true)
    await useCommunityStore.getState().likePost('999') // no match
    expect(useCommunityStore.getState().posts[0]).toEqual(MOCK_POST)
  })
})
