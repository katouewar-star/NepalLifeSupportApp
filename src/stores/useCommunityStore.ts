import { create } from 'zustand'
import {
  fetchPosts,
  createPost,
  toggleLike,
  fetchComments,
  addComment,
  POSTS_PAGE_SIZE,
  type Post,
  type PostCategory,
  type Comment,
} from '@/lib/community'

// ── Types ────────────────────────────────────────────────────────────────────

export type CategoryFilter = PostCategory | 'all'

interface CommunityStore {
  posts: Post[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  page: number
  error: string | null
  selectedCategory: CategoryFilter

  // Comment state
  comments: Record<string, Comment[]>
  commentsLoading: boolean

  // Actions
  loadPosts: (category?: PostCategory) => Promise<void>
  loadMorePosts: () => Promise<void>
  setCategory: (cat: CategoryFilter) => void
  addPost: (params: { title: string; body: string; category: PostCategory }) => Promise<void>
  likePost: (postId: string) => Promise<void>
  loadComments: (postId: string) => Promise<void>
  submitComment: (postId: string, body: string) => Promise<void>
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  page: 0,
  error: null,
  selectedCategory: 'all',
  comments: {},
  commentsLoading: false,

  loadPosts: async (category?: PostCategory) => {
    set({ loading: true, error: null, page: 0, hasMore: true })
    try {
      const posts = await fetchPosts(category, 0)
      set({ posts, loading: false, page: 0, hasMore: posts.length === POSTS_PAGE_SIZE })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: message })
    }
  },

  loadMorePosts: async () => {
    const { loading, loadingMore, hasMore, page, selectedCategory } = get()
    if (loading || loadingMore || !hasMore) return

    set({ loadingMore: true })
    try {
      const category = selectedCategory === 'all' ? undefined : (selectedCategory as PostCategory)
      const nextPage = page + 1
      const morePosts = await fetchPosts(category, nextPage)
      set((state) => ({
        posts: [...state.posts, ...morePosts],
        loadingMore: false,
        page: nextPage,
        hasMore: morePosts.length === POSTS_PAGE_SIZE,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loadingMore: false, error: message })
    }
  },

  setCategory: (cat: CategoryFilter) => {
    set({ selectedCategory: cat })
    // Automatically reload posts when category changes
    const category = cat === 'all' ? undefined : (cat as PostCategory)
    get().loadPosts(category)
  },

  addPost: async (params: { title: string; body: string; category: PostCategory }) => {
    set({ loading: true, error: null })
    try {
      const newPost = await createPost(params)
      set((state) => ({
        posts: [newPost, ...state.posts],
        loading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: message })
      throw err
    }
  },

  likePost: async (postId: string) => {
    try {
      const liked = await toggleLike(postId)
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id !== postId) return p
          return {
            ...p,
            like_count: liked ? p.like_count + 1 : Math.max(0, p.like_count - 1),
          }
        }),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message })
      throw err
    }
  },

  loadComments: async (postId: string) => {
    set({ commentsLoading: true })
    try {
      const loaded = await fetchComments(postId)
      set((state) => ({
        comments: { ...state.comments, [postId]: loaded },
        commentsLoading: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ commentsLoading: false, error: message })
      throw err
    }
  },

  submitComment: async (postId: string, body: string) => {
    const newComment = await addComment(postId, body)
    set((state) => {
      const existing = state.comments[postId] ?? []
      return { comments: { ...state.comments, [postId]: [...existing, newComment] } }
    })
  },
}))
