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
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { signIn } from '@/lib/auth'
import { useAuthStore } from '@/stores/useAuthStore'

export default function LoginScreen() {
  const router = useRouter()
  const { setUser, setSession } = useAuthStore()
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [authError, setAuthError] = useState('')

  const validate = (): boolean => {
    let valid = true
    setEmailError('')
    setPasswordError('')
    setAuthError('')

    if (!email) {
      setEmailError(t('auth.login.errorEmail'))
      valid = false
    }
    if (!password) {
      setPasswordError(t('auth.login.errorPassword'))
      valid = false
    }
    return valid
  }

  const handleLogin = async () => {
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await signIn({ email, password })

      if (result.error) {
        setAuthError(result.error.message)
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
      <View style={styles.inner}>
        <Text style={styles.title}>{t('auth.login.title')}</Text>

        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder={t('auth.login.emailPlaceholder')}
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
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          maxLength={128}
          autoComplete="current-password"
          textContentType="password"
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

        {isLoading ? (
          <ActivityIndicator testID="loading-indicator" style={styles.loader} />
        ) : (
          <TouchableOpacity testID="login-button" style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>{t('auth.login.button')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.login.footerText')}</Text>
          <Link href="/(auth)/register">
            <Text style={styles.link}>{t('auth.login.footerLink')}</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 },
  footerText: { color: '#666', fontSize: 14 },
  link: { color: '#E63946', fontSize: 14, fontWeight: '600' },
})
