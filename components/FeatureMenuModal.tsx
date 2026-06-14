import { useEffect, useRef } from 'react'
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

const PANEL_W = 290
const RED = '#E63946'

const FEATURES = [
  { key: 'translation', icon: '🌐', route: '/(tabs)/translation', bg: '#EFF6FF', accent: '#2563EB' },
  { key: 'job',         icon: '💼', route: '/(tabs)/job',         bg: '#F0FDF4', accent: '#16A34A' },
  { key: 'realestate',  icon: '🏡', route: '/(tabs)/realestate',  bg: '#FFF7ED', accent: '#EA580C' },
  { key: 'community',   icon: '💬', route: '/(tabs)/community',   bg: '#FFFBEB', accent: '#D97706' },
  { key: 'survey',      icon: '📋', route: '/(tabs)/survey',      bg: '#F5F3FF', accent: '#7C3AED' },
] as const

interface Props {
  visible: boolean
  onClose: () => void
  onSignOut: () => void
  userName?: string
}

export default function FeatureMenuModal({ visible, onClose, onSignOut, userName }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const slideAnim = useRef(new Animated.Value(PANEL_W)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: PANEL_W,
        duration: 180,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, slideAnim])

  const navigate = (route: string) => {
    onClose()
    setTimeout(() => router.push(route as any), 200)
  }

  if (!visible) return null

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Dimmed left area — tap to close */}
        <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

        {/* Slide-in panel */}
        <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>
              {t('home.sectionTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          {userName && (
            <View style={styles.greetingBox}>
              <Text style={styles.greetingText}>👤 {userName}</Text>
            </View>
          )}

          {/* Feature list */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {FEATURES.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={styles.item}
                onPress={() => navigate(f.route)}
                activeOpacity={0.75}
              >
                <View style={[styles.itemIconBox, { backgroundColor: f.bg }]}>
                  <Text style={styles.itemIcon}>{f.icon}</Text>
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel}>{t(`home.features.${f.key}.label`)}</Text>
                  <Text style={styles.itemDesc}>{t(`home.features.${f.key}.desc`)}</Text>
                </View>
                <Text style={[styles.chevron, { color: f.accent }]}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer: sign out */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} activeOpacity={0.75}>
              <Text style={styles.signOutText}>{t('home.signOut')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: PANEL_W,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RED,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },

  greetingBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greetingText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },

  list: {
    flex: 1,
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  itemIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: { fontSize: 20 },
  itemText: { flex: 1 },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: '#999',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  signOutBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
})
