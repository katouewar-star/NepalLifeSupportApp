import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import { signOut } from '@/lib/auth'
import LanguageToggle from '@/components/LanguageToggle'

export default function HomeScreen() {
  const router = useRouter()
  const { user, signOut: storeSignOut } = useAuthStore()
  const { t } = useTranslation()

  const FEATURES = useMemo(() => [
    { label: t('home.features.translation.label'), icon: '🌐', route: '/(tabs)/translation', desc: t('home.features.translation.desc') },
    { label: t('home.features.train.label'), icon: '🚃', route: '/(tabs)/train', desc: t('home.features.train.desc') },
    { label: t('home.features.job.label'), icon: '💼', route: '/(tabs)/job', desc: t('home.features.job.desc') },
    { label: t('home.features.trash.label'), icon: '🗑️', route: '/(tabs)/trash', desc: t('home.features.trash.desc') },
    { label: t('home.features.community.label'), icon: '💬', route: '/(tabs)/community', desc: t('home.features.community.desc') },
  ], [t])

  const handleSignOut = async () => {
    await signOut()
    storeSignOut()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.appName}>{t('home.appName')}</Text>
          <LanguageToggle />
        </View>
        <Text style={styles.greeting}>
          {t('home.greeting')}{user?.name ? `、${user.name}` : ''}{t('home.greetingSuffix')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>{t('home.sectionTitle')}</Text>

      <View style={styles.grid}>
        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.route}
            style={styles.card}
            onPress={() => router.push(f.route as any)}
          >
            <Text style={styles.cardIcon}>{f.icon}</Text>
            <Text style={styles.cardLabel}>{f.label}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{t('home.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: '#E63946',
    padding: 24,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    margin: 16,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#888', textAlign: 'center' },
  signOutButton: {
    margin: 16,
    marginTop: 24,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  signOutText: { color: '#666', fontSize: 14 },
})
