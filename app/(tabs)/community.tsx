import { View, Text, StyleSheet } from 'react-native'

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.title}>コミュニティ掲示板</Text>
      <Text style={styles.sub}>相談・Q&A・イベント情報</Text>
      <Text style={styles.coming}>（実装中）</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  icon: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },
  coming: { fontSize: 12, color: '#aaa', marginTop: 16 },
})
