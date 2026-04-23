import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'

export default function LanguageToggle() {
  const { t } = useTranslation()
  const { language, setLanguage } = useAuthStore()

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setLanguage(language === 'ja' ? 'ne' : 'ja')}
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
