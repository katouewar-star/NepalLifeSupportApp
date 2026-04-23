import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '@/stores/useAuthStore'
import { getCurrentSession } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { initI18n } from '@/lib/i18n'

initI18n(useAuthStore.getState().language)

export default function RootLayout() {
  const { setUser, setSession, signOut } = useAuthStore()

  useEffect(() => {
    // 起動時にセッション復元
    getCurrentSession().then(({ session }) => {
      if (!session) return
      setSession(session)
    })

    // Auth 状態変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          signOut()
          return
        }
        if (session) {
          setSession({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          })
          const user = session.user
          setUser({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name ?? '',
          })
        }
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
