import React, { memo, useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useCommunityStore, type CategoryFilter } from '../../src/stores/useCommunityStore'
import { useAuthStore } from '../../src/stores/useAuthStore'
import { type Post, type PostCategory } from '../../src/lib/community'

const ORANGE = '#E67E22'

// ── Category helpers ─────────────────────────────────────────────────────────

function categoryColor(cat: PostCategory): string {
  switch (cat) {
    case 'qa':    return '#2980B9'
    case 'life':  return '#27AE60'
    case 'event': return '#8E44AD'
  }
}

// ── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post
  onPress: (post: Post) => void
  onLike: (postId: string) => void
}

const PostCard = memo(function PostCard({ post, onPress, onLike }: PostCardProps) {
  const { t } = useTranslation()
  const color = categoryColor(post.category)

  const categoryLabel = (() => {
    switch (post.category) {
      case 'qa':    return t('community.filterQa')
      case 'life':  return t('community.filterLife')
      case 'event': return t('community.filterEvent')
    }
  })()

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(post)}
      activeOpacity={0.85}
    >
      {/* Category badge */}
      <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.categoryBadgeText, { color }]}>{categoryLabel}</Text>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>

      {/* Body preview */}
      <Text style={styles.cardBody} numberOfLines={2}>{post.body}</Text>

      {/* Footer: likes */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={() => onLike(post.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.likeBtnText}>
            {'♡ '}{post.like_count} {t('community.likes')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateText}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )
})

// ── Create Post Modal ─────────────────────────────────────────────────────────

interface CreatePostModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (params: { title: string; body: string; category: PostCategory }) => Promise<void>
}

function CreatePostModal({ visible, onClose, onSubmit }: CreatePostModalProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<PostCategory>('qa')
  const [submitting, setSubmitting] = useState(false)

  const categories: { key: PostCategory; label: string }[] = [
    { key: 'qa',    label: t('community.filterQa') },
    { key: 'life',  label: t('community.filterLife') },
    { key: 'event', label: t('community.filterEvent') },
  ]

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), body: body.trim(), category })
      setTitle('')
      setBody('')
      setCategory('qa')
      onClose()
    } catch {
      // error surfaced via store
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setBody('')
    setCategory('qa')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('community.createPost.title')}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Category selector */}
          <Text style={styles.fieldLabel}>{t('community.createPost.categoryLabel')}</Text>
          <View style={styles.categoryRow}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.categoryPill,
                  category === c.key && { backgroundColor: categoryColor(c.key), borderColor: categoryColor(c.key) },
                ]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={[styles.categoryPillText, category === c.key && { color: '#fff' }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title input */}
          <Text style={styles.fieldLabel}>{t('community.createPost.titleLabel')}</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder={t('community.createPost.titleLabel')}
            maxLength={100}
          />

          {/* Body input */}
          <Text style={styles.fieldLabel}>{t('community.createPost.bodyLabel')}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={body}
            onChangeText={setBody}
            placeholder={t('community.createPost.bodyLabel')}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>{t('community.createPost.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!title.trim() || !body.trim() || submitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !body.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>{t('community.createPost.submit')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    selectedCategory,
    loadPosts,
    loadMorePosts,
    setCategory,
    addPost,
    likePost,
  } = useCommunityStore()
  const { isAuthenticated } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Load posts on mount
  useEffect(() => {
    const category = selectedCategory === 'all' ? undefined : (selectedCategory as PostCategory)
    loadPosts(category)
  }, [])

  const handleCategoryChange = useCallback(
    (cat: CategoryFilter) => {
      setCategory(cat)
    },
    [setCategory]
  )

  const handlePostPress = useCallback((post: Post) => {
    router.push(`/post/${post.id}` as any)
  }, [router])

  const handleLike = useCallback(
    (postId: string) => {
      if (!isAuthenticated) {
        Alert.alert('', 'Please sign in to like posts')
        return
      }
      likePost(postId)
    },
    [isAuthenticated, likePost]
  )

  const handleCreatePost = useCallback(
    async (params: { title: string; body: string; category: PostCategory }) => {
      await addPost(params)
    },
    [addPost]
  )

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading && !loadingMore) loadMorePosts()
  }, [hasMore, loading, loadingMore, loadMorePosts])

  const renderPostCard = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard post={item} onPress={handlePostPress} onLike={handleLike} />
    ),
    [handlePostPress, handleLike]
  )

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: 'all',   label: t('community.filterAll') },
    { key: 'qa',    label: t('community.filterQa') },
    { key: 'life',  label: t('community.filterLife') },
    { key: 'event', label: t('community.filterEvent') },
  ]

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('community.title')}</Text>
      </View>

      {/* Category filter pills */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, selectedCategory === f.key && styles.filterBtnActive]}
            onPress={() => handleCategoryChange(f.key)}
          >
            <Text
              style={[styles.filterText, selectedCategory === f.key && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Post list */}
      {loading && posts.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderPostCard}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator style={styles.footerLoader} color={ORANGE} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>{t('community.noResults')}</Text>
            </View>
          }
          onRefresh={() => {
            const category =
              selectedCategory === 'all' ? undefined : (selectedCategory as PostCategory)
            loadPosts(category)
          }}
          refreshing={loading}
        />
      )}

      {/* FAB - only shown to authenticated users */}
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+ {t('community.newPost')}</Text>
        </TouchableOpacity>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: ORANGE,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  // ── Filter pills ──
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  filterText: { fontSize: 12, color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  // ── List ──
  listContent: { padding: 16, gap: 12, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#999' },
  footerLoader: { marginVertical: 16 },

  // ── Post card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '600' },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
    lineHeight: 21,
  },
  cardBody: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  likeBtnText: { fontSize: 13, color: ORANGE, fontWeight: '600' },
  dateText: { fontSize: 11, color: '#bbb' },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: ORANGE,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // ── Create Post Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#1a1a2e' },
  modalClose: { fontSize: 18, color: '#888' },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },

  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  categoryPillText: { fontSize: 13, color: '#555', fontWeight: '500' },

  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#555', fontWeight: '600' },
  submitBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#f0c899' },
  submitBtnText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
})
