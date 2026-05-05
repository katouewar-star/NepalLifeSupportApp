import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function TrainScreen() {
  const { t } = useTranslation()

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.train')}</Text>
      </View>

      {/* Coming soon card */}
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🚃</Text>
          </View>
          <Text style={styles.title}>電車・乗り換え案内</Text>
          <Text style={styles.desc}>最寄り駅からの経路検索、遅延情報をまとめて確認できます。</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>実装中</Text>
          </View>
        </View>

        {/* Upcoming features */}
        {[
          { icon: '🗺️', label: '乗り換え案内', desc: '駅から駅へのルートを検索' },
          { icon: '⏰', label: '遅延情報', desc: '主要路線のリアルタイム遅延' },
          { icon: '📍', label: '最寄り駅', desc: '現在地から近くの駅を表示' },
        ].map((item) => (
          <View key={item.label} style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{item.label}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const PURPLE = '#8E44AD'

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: PURPLE,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  body: { flex: 1, padding: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: PURPLE + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  desc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  badge: {
    backgroundColor: PURPLE + '18',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 13, color: PURPLE, fontWeight: '600' },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: PURPLE + '14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIcon: { fontSize: 20 },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: '#999' },
})
