import { create } from 'zustand'
import { fetchPosts, createPost, toggleLike, fetchComments, addComment, type Post, type PostCategory, type Comment } from '@/lib/community'

// ── Types ────────────────────────────────────────────────────────────────────

export type CategoryFilter = PostCategory | 'all'

interface CommunityStore {
  posts: Post[]
  loading: boolean
  error: string | null
  selectedCategory: CategoryFilter

  // Comment state
  comments: Record<string, Comment[]>
  commentsLoading: boolean

  // Actions
  loadPosts: (category?: PostCategory) => Promise<void>
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
  error: null,
  selectedCategory: 'all',
  comments: {},
  commentsLoading: false,

  loadPosts: async (category?: PostCategory) => {
    set({ loading: true, error: null })
    try {
      const posts = await fetchPosts(category)
      set({ posts, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: message })
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
