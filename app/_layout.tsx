import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase'
import { initI18n } from '@/lib/i18n'

initI18n(useAuthStore.getState().language)

export default function RootLayout() {
  const { setUser, setSession, setLoading, signOut } = useAuthStore()

  useEffect(() => {
    // Auth 状態変化を監視（INITIAL_SESSION で起動時セッションも復元される）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          signOut()
        } else {
          setSession({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          })
          const user = session.user
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          setUser({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name ?? '',
            role: (profile?.role as 'admin' | 'user') ?? 'user',
          })
        }
        // 初回イベント処理後にローディング解除
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
