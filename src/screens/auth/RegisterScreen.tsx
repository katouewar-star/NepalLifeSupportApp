import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { signUp, PASSWORD_MIN_LENGTH } from '@/lib/auth'
import { useAuthStore } from '@/stores/useAuthStore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterScreen() {
  const router = useRouter()
  const { setUser, setSession } = useAuthStore()
  const language = useAuthStore((s) => s.language)
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [authError, setAuthError] = useState('')

  const validate = (): boolean => {
    let valid = true
    setNameError(''); setEmailError(''); setPasswordError(''); setAuthError('')
    if (!name.trim()) { setNameError(t('auth.register.errorName')); valid = false }
    if (!email) { setEmailError(t('auth.register.errorEmail')); valid = false }
    else if (!EMAIL_REGEX.test(email)) { setEmailError(t('auth.register.errorEmailFormat')); valid = false }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(t('auth.register.errorPassword', { min: PASSWORD_MIN_LENGTH }))
      valid = false
    }
    return valid
  }

  const handleRegister = async () => {
    if (!validate()) return
    setIsLoading(true)
    try {
      const result = await signUp({ email, password, name, language })
      if (result.error) { setAuthError(result.error.message); return }
      if (result.needsEmailConfirmation) { setAuthError(t('auth.register.emailConfirmation')); return }
      if (result.user) setUser(result.user)
      if (result.session) setSession(result.session)
      router.replace('/(tabs)/')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Text style={styles.heroFlag}>🇳🇵</Text>
          <Text style={styles.heroApp}>ネパール生活支援</Text>
          <Text style={styles.heroSub}>Nepal Life Support</Text>
          <View style={styles.flagStripe} />
        </View>

        {/* ── Form card ── */}
        <View style={styles.formCard}>
          <Text style={styles.title}>{t('auth.register.title')}</Text>

          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder={t('auth.register.namePlaceholder')}
              value={name}
              onChangeText={setName}
              maxLength={100}
              autoComplete="name"
              textContentType="name"
            />
            {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder={t('auth.register.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={254}
              autoComplete="email"
              textContentType="emailAddress"
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          <View style={styles.fieldWrap}>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder={t('auth.register.passwordPlaceholder', { min: PASSWORD_MIN_LENGTH })}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              maxLength={128}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
          </View>

          {authError ? (
            <View style={styles.authErrorBox}>
              <Text style={styles.authErrorText}>{authError}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <ActivityIndicator testID="loading-indicator" style={styles.loader} color={RED} />
          ) : (
            <TouchableOpacity testID="register-button" style={styles.button} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.buttonText}>{t('auth.register.button')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.register.footerText')}</Text>
            <Link href="/(auth)/login">
              <Text style={styles.link}>{t('auth.register.footerLink')}</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const RED = '#E63946'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: RED },
  scroll: { flexGrow: 1 },

  hero: {
    backgroundColor: RED,
    paddingTop: 70,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroFlag: { fontSize: 48, marginBottom: 10 },
  heroApp: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 18 },
  flagStripe: {
    width: 60,
    height: 4,
    backgroundColor: '#003893',
    borderRadius: 2,
  },

  formCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 24,
    textAlign: 'center',
  },

  fieldWrap: { marginBottom: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a2e',
  },
  inputError: { borderColor: RED },
  fieldError: { color: RED, fontSize: 12, marginTop: 4, marginLeft: 4 },

  authErrorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  authErrorText: { color: RED, fontSize: 13 },

  button: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginVertical: 16 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: { color: '#888', fontSize: 14 },
  link: { color: RED, fontSize: 14, fontWeight: '700' },
})
