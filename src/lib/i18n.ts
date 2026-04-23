import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ja from '../locales/ja/translation.json'
import ne from '../locales/ne/translation.json'

export function initI18n(defaultLanguage: 'ja' | 'ne' = 'ne') {
  if (i18n.isInitialized) return i18n
  i18n.use(initReactI18next).init({
    resources: { ja: { translation: ja }, ne: { translation: ne } },
    lng: defaultLanguage,
    fallbackLng: 'ne',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  })
  return i18n
}

export default i18n
