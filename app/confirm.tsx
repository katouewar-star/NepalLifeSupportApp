import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/(auth)/login')
      return
    }

    // イベントを取り逃がした場合に備え、既存セッションを先にチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success')
        setTimeout(() => router.replace('/(tabs)/'), 1500)
        return
      }

      // セッションがなければ onAuthStateChange で待つ
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          setStatus('success')
          setTimeout(() => router.replace('/(tabs)/'), 1500)
        } else if (event === 'SIGNED_OUT') {
          setStatus('error')
        }
      })

      // 10秒でタイムアウト
      const timeout = setTimeout(() => {
        setStatus('error')
      }, 10000)

      return () => {
        subscription.unsubscribe()
        clearTimeout(timeout)
      }
    })
  }, [])

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color="#E84545" />
          <Text style={styles.text}>メール認証中...</Text>
        </>
      )}
      {status === 'success' && (
        <Text style={styles.text}>認証完了！ホームへ移動します...</Text>
      )}
      {status === 'error' && (
        <Text style={styles.errorText}>
          認証に失敗しました。{'\n'}メールのリンクを再度クリックしてください。
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#E84545',
    textAlign: 'center',
  },
})
