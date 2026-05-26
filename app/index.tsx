import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    )
  }
  return <Redirect href={isAuthenticated ? '/(tabs)/' : '/(auth)/login'} />
}
