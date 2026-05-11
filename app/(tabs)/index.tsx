import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { signOut } from '@/lib/auth'
import LanguageToggle from '@/components/LanguageToggle'

const FEATURE_COLORS = [
  '#2980B9', // translation
  '#8E44AD', // train
  '#E63946', // job
  '#1B4F72', // school
  '#16A085', // realestate
  '#27AE60', // trash
  '#E67E22', // community
  '#C0392B', // pizza
  '#2471A3', // survey
]

export default function HomeScreen() {
  const router = useRouter()
  const { user, signOut: storeSignOut } = useAuthStore()
  const { t } = useTranslation()

  const FEATURES = useMemo(() => [
    { label: t('home.features.translation.label'), icon: '🌐', route: '/(tabs)/translation', desc: t('home.features.translation.desc') },
    { label: t('home.features.train.label'),       icon: '🚃', route: '/(tabs)/train',       desc: t('home.features.train.desc') },
    { label: t('home.features.job.label'),         icon: '💼', route: '/(tabs)/job',         desc: t('home.features.job.desc') },
    { label: t('home.features.school.label'),      icon: '🎓', route: '/(tabs)/school',      desc: t('home.features.school.desc') },
    { label: t('home.features.realestate.label'), icon: '🏡', route: '/(tabs)/realestate',  desc: t('home.features.realestate.desc') },
    { label: t('home.features.trash.label'),       icon: '🗑️', route: '/(tabs)/trash',       desc: t('home.features.trash.desc') },
    { label: t('home.features.community.label'),   icon: '💬', route: '/(tabs)/community',   desc: t('home.features.community.desc') },
    { label: t('home.features.pizza.label'),       icon: '🍕', route: '/(tabs)/pizza',       desc: t('home.features.pizza.desc') },
    { label: t('home.features.survey.label'),      icon: '📋', route: '/(tabs)/survey',      desc: t('home.features.survey.desc') },
  ], [t])

  const handleSignOut = async () => {
    await signOut()
    storeSignOut()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── Hero header ── */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.appName}>{t('home.appName')}</Text>
            <Text style={styles.greeting}>
              {t('home.greeting')}
              {user?.name ? `、${user.name}` : ''}
              {t('home.greetingSuffix')}
            </Text>
          </View>
          <LanguageToggle />
        </View>
        <View style={styles.flagStripe} />
      </View>

      {/* ── Section label ── */}
      <Text style={styles.sectionLabel}>{t('home.sectionTitle')}</Text>

      {/* ── Feature grid ── */}
      <View style={styles.grid}>
        {FEATURES.map((f, i) => (
          <TouchableOpacity
            key={f.route}
            style={styles.card}
            onPress={() => router.push(f.route as any)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, { backgroundColor: FEATURE_COLORS[i] + '18' }]}>
              <Text style={styles.cardIcon}>{f.icon}</Text>
            </View>
            <Text style={styles.cardLabel}>{f.label}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
            <View style={[styles.cardAccent, { backgroundColor: FEATURE_COLORS[i] }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Sign out ── */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
        <Text style={styles.signOutText}>{t('home.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const RED = '#E63946'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 40 },

  hero: {
    backgroundColor: RED,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroTextBlock: { flex: 1, marginRight: 12 },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  flagStripe: {
    height: 6,
    backgroundColor: '#003893',
    marginHorizontal: -24,
    marginTop: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: '46.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardIcon: { fontSize: 26 },
  cardLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#999', lineHeight: 16 },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  signOutBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  signOutText: { color: '#888', fontSize: 14, fontWeight: '600' },
})
