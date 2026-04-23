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
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setAuthError('')

    if (!name.trim()) {
      setNameError(t('auth.register.errorName'))
      valid = false
    }
    if (!email) {
      setEmailError(t('auth.register.errorEmail'))
      valid = false
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError(t('auth.register.errorEmailFormat'))
      valid = false
    }
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

      if (result.error) {
        setAuthError(result.error.message)
        return
      }

      if (result.needsEmailConfirmation) {
        setAuthError(t('auth.register.emailConfirmation'))
        return
      }

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
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('auth.register.title')}</Text>

        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder={t('auth.register.namePlaceholder')}
          value={name}
          onChangeText={setName}
          maxLength={100}
          autoComplete="name"
          textContentType="name"
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

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
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

        {isLoading ? (
          <ActivityIndicator testID="loading-indicator" style={styles.loader} />
        ) : (
          <TouchableOpacity testID="register-button" style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>{t('auth.register.button')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.register.footerText')}</Text>
          <Link href="/(auth)/login">
            <Text style={styles.link}>{t('auth.register.footerLink')}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#1a1a2e' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 4,
    backgroundColor: '#fafafa',
  },
  inputError: { borderColor: '#E63946' },
  errorText: { color: '#E63946', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  button: {
    backgroundColor: '#E63946',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4, flexWrap: 'wrap' },
  footerText: { color: '#666', fontSize: 14 },
  link: { color: '#E63946', fontSize: 14, fontWeight: '600' },
})
