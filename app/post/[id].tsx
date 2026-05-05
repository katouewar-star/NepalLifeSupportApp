import { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useCommunityStore } from '../../src/stores/useCommunityStore'
import { useAuthStore } from '../../src/stores/useAuthStore'
import { fetchPosts, type PostCategory } from '../../src/lib/community'

const ORANGE = '#E67E22'

function categoryColor(cat: PostCategory): string {
  switch (cat) {
    case 'qa':    return '#2980B9'
    case 'life':  return '#27AE60'
    case 'event': return '#8E44AD'
  }
}

// ── Post Detail Screen ────────────────────────────────────────────────────────

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { t } = useTranslation()

  const { posts, comments, commentsLoading, loadComments, submitComment, likePost, loadPosts } =
    useCommunityStore()
  const { isAuthenticated } = useAuthStore()

  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [postLoading, setPostLoading] = useState(false)

  // Find the post in the already-loaded list, or fetch it
  const post = posts.find((p) => p.id === id)

  useEffect(() => {
    if (!post) {
      // Post not in store; reload the full list so we can find it
      setPostLoading(true)
      loadPosts().finally(() => setPostLoading(false))
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadComments(id)
    }
  }, [id])

  const postComments = (id ? comments[id] : undefined) ?? []

  const categoryLabel = (() => {
    if (!post) return ''
    switch (post.category) {
      case 'qa':    return t('community.filterQa')
      case 'life':  return t('community.filterLife')
      case 'event': return t('community.filterEvent')
    }
  })()

  const handleLike = useCallback(() => {
    if (!post) return
    likePost(post.id)
  }, [post, likePost])

  const handleSubmit = useCallback(async () => {
    if (!commentText.trim() || submitting || !id) return
    setSubmitting(true)
    try {
      await submitComment(id, commentText.trim())
      setCommentText('')
    } catch {
      // error is surfaced by the store
    } finally {
      setSubmitting(false)
    }
  }, [commentText, submitting, id, submitComment])

  // ── Loading states ────────────────────────────────────────────────────────

  if (postLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>{t('community.postNotFound')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnFallback}>
          <Text style={styles.backBtnFallbackText}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const color = categoryColor(post.category)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {post.title}
        </Text>
      </View>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post card */}
        <View style={styles.postCard}>
          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color }]}>{categoryLabel}</Text>
          </View>

          {/* Full title */}
          <Text style={styles.postTitle}>{post.title}</Text>

          {/* Full body */}
          <Text style={styles.postBody}>{post.body}</Text>

          {/* Footer: likes + date */}
          <View style={styles.postFooter}>
            <TouchableOpacity
              onPress={handleLike}
              style={styles.likeBtn}
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
        </View>

        {/* Section divider */}
        <View style={styles.divider}>
          <Text style={styles.dividerText}>
            {`コメント (${postComments.length}件)`}
          </Text>
        </View>

        {/* Comment list */}
        {commentsLoading ? (
          <ActivityIndicator color={ORANGE} style={{ marginTop: 20 }} />
        ) : (
          postComments.map((comment, index) => (
            <View key={comment.id} style={styles.commentRow}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentNumber}>{`>>${index + 1}`}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.commentBody}>{comment.body}</Text>
            </View>
          ))
        )}

        {/* Bottom padding so last comment is not hidden behind input bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Input bar ────────────────────────────────────────────────────── */}
      <View style={styles.inputBar}>
        {isAuthenticated ? (
          <>
            <TextInput
              style={styles.textInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder={t('community.commentPlaceholder')}
              multiline
              maxLength={500}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!commentText.trim() || submitting) && styles.sendBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>{t('community.commentSend')}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.loginRequiredText}>{t('community.loginRequired')}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  notFoundText: { fontSize: 16, color: '#888', marginBottom: 16 },
  backBtnFallback: { paddingHorizontal: 20, paddingVertical: 10 },
  backBtnFallbackText: { color: ORANGE, fontSize: 16 },

  // Header
  header: {
    backgroundColor: ORANGE,
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  // Post card
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '600' },
  postTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 10,
    lineHeight: 24,
  },
  postBody: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 14,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  likeBtnText: { fontSize: 14, color: ORANGE, fontWeight: '600' },
  dateText: { fontSize: 11, color: '#bbb' },

  // Section divider
  divider: {
    backgroundColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  dividerText: { fontSize: 13, fontWeight: 'bold', color: '#555' },

  // Comment rows
  commentRow: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentNumber: { fontSize: 12, color: ORANGE, fontWeight: 'bold' },
  commentDate: { fontSize: 11, color: '#bbb', textAlign: 'right' },
  commentBody: { fontSize: 14, color: '#333', lineHeight: 20 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: '#fafafa',
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#f0c899' },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  loginRequiredText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    paddingVertical: 8,
  },
})
