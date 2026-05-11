import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { VOCAB_CATEGORIES, VocabCategory } from '@/lib/study'

const RED = '#E63946'

export default function StudyScreen() {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState(VOCAB_CATEGORIES[0].id)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const category: VocabCategory = VOCAB_CATEGORIES.find((c) => c.id === categoryId)!
  const card = category.cards[cardIndex]
  const total = category.cards.length

  const selectCategory = (id: string) => {
    setCategoryId(id)
    setCardIndex(0)
    setFlipped(false)
  }

  const prev = () => {
    setCardIndex((i) => (i > 0 ? i - 1 : total - 1))
    setFlipped(false)
  }

  const next = () => {
    setCardIndex((i) => (i < total - 1 ? i + 1 : 0))
    setFlipped(false)
  }

  return (
    <View style={s.wrapper}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>語学学習</Text>
          <Text style={s.headerSub}>भाषा अध्ययन</Text>
        </View>
        <View style={s.backBtn} />
      </View>

      {/* Category selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catRow}
      >
        {VOCAB_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[s.catBtn, cat.id === categoryId && s.catBtnActive]}
            onPress={() => selectCategory(cat.id)}
          >
            <Text style={s.catIcon}>{cat.icon}</Text>
            <Text style={[s.catLabel, cat.id === categoryId && s.catLabelActive]}>
              {cat.label.ja}
            </Text>
            <Text style={[s.catLabelNe, cat.id === categoryId && s.catLabelActive]}>
              {cat.label.ne}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress */}
      <View style={s.progressRow}>
        <Text style={s.progressText}>{cardIndex + 1} / {total}</Text>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${((cardIndex + 1) / total) * 100}%` as any }]} />
        </View>
      </View>

      {/* Flashcard */}
      <View style={s.cardArea}>
        <TouchableOpacity
          style={[s.card, flipped && s.cardFlipped]}
          onPress={() => setFlipped((f) => !f)}
          activeOpacity={0.9}
        >
          {!flipped ? (
            <>
              <Text style={s.cardLang}>🇯🇵 日本語</Text>
              <Text style={s.cardMain}>{card.japanese}</Text>
              {card.reading && <Text style={s.cardReading}>{card.reading}</Text>}
              <Text style={s.tapHint}>タップして裏を見る / ट्याप गर्नुहोस्</Text>
            </>
          ) : (
            <>
              <Text style={s.cardLang}>🇳🇵 नेपाली</Text>
              <Text style={[s.cardMain, s.cardMainFlipped]}>{card.nepali}</Text>
              <Text style={s.tapHint}>タップして表に戻る / फर्कन ट्याप</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={s.navRow}>
        <TouchableOpacity style={s.navBtn} onPress={prev}>
          <Text style={s.navBtnText}>◀ 前</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.flipBtn}
          onPress={() => setFlipped((f) => !f)}
        >
          <Text style={s.flipBtnText}>🔄 裏返す</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.navBtn} onPress={next}>
          <Text style={s.navBtnText}>次 ▶</Text>
        </TouchableOpacity>
      </View>

      {/* Tip */}
      <Text style={s.tip}>カードをタップして{flipped ? '日本語' : 'ネパール語'}を確認しよう</Text>
    </View>
  )
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: RED,
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 36, alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },

  catRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  catBtn: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    minWidth: 72,
  },
  catBtnActive: { backgroundColor: RED, borderColor: RED },
  catIcon: { fontSize: 20, marginBottom: 2 },
  catLabel: { fontSize: 11, fontWeight: '700', color: '#333' },
  catLabelNe: { fontSize: 9, color: '#999' },
  catLabelActive: { color: '#fff' },

  progressRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 6,
  },
  progressText: { fontSize: 12, color: '#888', textAlign: 'right' },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: RED, borderRadius: 2 },

  cardArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 200,
    justifyContent: 'center',
    gap: 12,
    borderTopWidth: 4,
    borderTopColor: RED,
  },
  cardFlipped: { borderTopColor: '#003893' },
  cardLang: { fontSize: 13, color: '#aaa', fontWeight: '600' },
  cardMain: { fontSize: 30, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', lineHeight: 40 },
  cardMainFlipped: { color: '#003893' },
  cardReading: { fontSize: 14, color: '#888', textAlign: 'center' },
  tapHint: { fontSize: 11, color: '#ccc', marginTop: 8 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  navBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  flipBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: RED,
    alignItems: 'center',
  },
  flipBtnText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  tip: { textAlign: 'center', fontSize: 11, color: '#bbb', paddingBottom: 20 },
})
