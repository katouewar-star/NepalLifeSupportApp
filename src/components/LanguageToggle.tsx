import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAuthStore, AppLanguage } from '@/stores/useAuthStore'

const NEXT_LANG: Record<AppLanguage, AppLanguage> = { ne: 'ja', ja: 'en', en: 'ne' }

export default function LanguageToggle() {
  const { t } = useTranslation()
  const { language, setLanguage } = useAuthStore()

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setLanguage(NEXT_LANG[language])}
    >
      <Text style={styles.text}>{t('home.langToggle')}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
})
