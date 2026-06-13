import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useTranslation } from 'react-i18next'

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 18 }}>{label}</Text>
}

export default function TabsLayout() {
  const { t } = useTranslation()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#bbb',
        tabBarStyle: {
          paddingBottom: 6,
          paddingTop: 4,
          height: 58,
          borderTopWidth: 1,
          borderTopColor: '#eee',
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
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
          href: null,
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
        name="school"
        options={{
          title: t('tabs.school'),
          tabBarIcon: () => <TabIcon label="🎓" />,
        }}
      />
      <Tabs.Screen
        name="realestate"
        options={{
          title: t('tabs.realestate'),
          tabBarIcon: () => <TabIcon label="🏡" />,
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: t('tabs.trash'),
          tabBarIcon: () => <TabIcon label="🗑️" />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: () => <TabIcon label="💬" />,
        }}
      />
      <Tabs.Screen
        name="visa"
        options={{
          title: t('tabs.visa'),
          tabBarIcon: () => <TabIcon label="🛂" />,
        }}
      />
      <Tabs.Screen
        name="survey"
        options={{
          title: t('tabs.survey'),
          tabBarIcon: () => <TabIcon label="📋" />,
        }}
      />
      <Tabs.Screen
        name="travel"
        options={{
          title: t('tabs.travel'),
          tabBarIcon: () => <TabIcon label="✈️" />,
        }}
      />
    </Tabs>
  )
}
