import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useTranslation } from 'react-i18next'

// アイコンの代替（Phase1はテキストアイコン、後でアイコンライブラリ導入）
function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 20 }}>{label}</Text>
}

export default function TabsLayout() {
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: () => <TabIcon label="🏠" />,
        }}
      />
      <Tabs.Screen
        name="translation"
        options={{
          title: t('tabs.translation'),
          tabBarIcon: () => <TabIcon label="🌐" />,
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: t('tabs.train'),
          tabBarIcon: () => <TabIcon label="🚃" />,
        }}
      />
      <Tabs.Screen
        name="job"
        options={{
          title: t('tabs.job'),
          tabBarIcon: () => <TabIcon label="💼" />,
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: t('tabs.trash'),
          tabBarIcon: () => <TabIcon label="🗑️" />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: () => <TabIcon label="💬" />,
        }}
      />
    </Tabs>
  )
}
