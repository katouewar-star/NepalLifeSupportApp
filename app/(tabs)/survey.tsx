import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  submitSurvey,
  INITIAL_SURVEY,
  SurveyData,
  Q1_OPTIONS,
  Q2_OPTIONS,
  Q6_OPTIONS,
  Q8_OPTIONS,
  Q10_OPTIONS,
  Q11_OPTIONS,
} from '@/lib/survey'

const RED = '#E63946'
const LIGHT_RED = '#FDEDEE'

// ── Bilingual question label ──
function QLabel({ num, ja, ne }: { num: number; ja: string; ne: string }) {
  return (
    <View style={s.qLabel}>
      <Text style={s.qNum}>Q{num}</Text>
      <View style={s.qTextBox}>
        <Text style={s.qJa}>{ja}</Text>
        <Text style={s.qNe}>{ne}</Text>
      </View>
    </View>
  )
}

// ── Star rating ──
function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} style={s.starBtn}>
          <Text style={[s.star, value >= n && s.starOn]}>★</Text>
        </TouchableOpacity>
      ))}
      {value > 0 && <Text style={s.starScore}>{value} / 5</Text>}
    </View>
  )
}

// ── Single select (radio) ──
function Radio({
  options,
  value,
  onChange,
}: {
  options: { value: string; ja: string; ne: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <View style={s.pillGrid}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <TouchableOpacity
            key={o.value}
            style={[s.pill, active && s.pillActive]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[s.pillJa, active && s.pillTextActive]}>{o.ja}</Text>
            <Text style={[s.pillNe, active && s.pillNeActive]}>{o.ne}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ── Multi select (checkbox) ──
function Checkbox({
  options,
  values,
  onChange,
}: {
  options: { value: string; ja: string; ne: string }[]
  values: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
  return (
    <View style={s.pillGrid}>
      {options.map((o) => {
        const active = values.includes(o.value)
        return (
          <TouchableOpacity
            key={o.value}
            style={[s.pill, active && s.pillActive]}
            onPress={() => toggle(o.value)}
          >
            <Text style={[s.pillJa, active && s.pillTextActive]}>{o.ja}</Text>
            <Text style={[s.pillNe, active && s.pillNeActive]}>{o.ne}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ── Section divider ──
function Section({ title }: { title: string }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionText}>{title}</Text>
    </View>
  )
}

// ── Thank you screen ──
function ThankYou() {
  return (
    <View style={s.thankYouBox}>
      <Text style={s.thankYouIcon}>🙏</Text>
      <Text style={s.thankYouJa}>ご回答ありがとうございます！</Text>
      <Text style={s.thankYouNe}>धन्यवाद! तपाईंको जवाफ पठाइयो।</Text>
    </View>
  )
}

// ── Main screen ──
export default function SurveyScreen() {
  const { user } = useAuthStore()
  const [data, setData] = useState<SurveyData>(INITIAL_SURVEY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = <K extends keyof SurveyData>(key: K, value: SurveyData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!data.q1_residence) {
      Alert.alert(
        '入力してください / कृपया भर्नुहोस्',
        'Q1（在住期間）を選択してください\nQ1 छान्नुहोस्'
      )
      return
    }
    setSubmitting(true)
    try {
      await submitSurvey(data, user?.id)
      setSubmitted(true)
    } catch {
      Alert.alert('エラー', 'アンケートの送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.wrapper}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>アンケート</Text>
        <Text style={s.headerSub}>प्रश्नावली</Text>
      </View>

      {submitted ? (
        <ThankYou />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

          {/* ── 基本情報 ── */}
          <Section title="基本情報 / आधारभूत जानकारी" />

          <View style={s.qCard}>
            <QLabel num={1} ja="日本に住んでどのくらいになりますか？" ne="जापानमा कति समयदेखि बस्नुभएको छ？" />
            <Radio options={Q1_OPTIONS} value={data.q1_residence} onChange={(v) => set('q1_residence', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={2} ja="日本語のレベルは？" ne="जापानी भाषाको स्तर？" />
            <Radio options={Q2_OPTIONS} value={data.q2_japanese_level} onChange={(v) => set('q2_japanese_level', v)} />
          </View>

          {/* ── アプリ評価 ── */}
          <Section title="アプリ評価 / एप मूल्यांकन" />

          <View style={s.qCard}>
            <QLabel num={3} ja="アプリは使いやすいですか？" ne="एप कति प्रयोग गर्न सजिलो छ？" />
            <Stars value={data.q3_usability} onChange={(v) => set('q3_usability', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={4} ja="デザインや色はどうですか？" ne="डिजाइन र रङ कस्तो लाग्यो？" />
            <Stars value={data.q4_design} onChange={(v) => set('q4_design', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={5} ja="アプリの動作速度はどうですか？" ne="एपको गति कस्तो छ？" />
            <Stars value={data.q5_speed} onChange={(v) => set('q5_speed', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={7} ja="翻訳機能の精度はどうでしたか？" ne="अनुवाद सुविधाको सटीकता？" />
            <Stars value={data.q7_translation_accuracy} onChange={(v) => set('q7_translation_accuracy', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={9} ja="全体的な満足度は？" ne="समग्र सन्तुष्टि कति छ？" />
            <Stars value={data.q9_satisfaction} onChange={(v) => set('q9_satisfaction', v)} />
          </View>

          {/* ── 機能について ── */}
          <Section title="機能について / सुविधाहरूको बारेमा" />

          <View style={s.qCard}>
            <QLabel num={6} ja="どの機能が最も役立ちましたか？（複数可）" ne="कुन सुविधा सबैभन्दा उपयोगी लाग्यो？" />
            <Checkbox options={Q6_OPTIONS} values={data.q6_useful_features} onChange={(v) => set('q6_useful_features', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={8} ja="追加してほしい機能は？（複数可）" ne="थप गर्नुपर्ने सुविधाहरू？" />
            <Checkbox options={Q8_OPTIONS} values={data.q8_wanted_features} onChange={(v) => set('q8_wanted_features', v)} />
          </View>

          {/* ── 推薦・課金 ── */}
          <Section title="推薦・課金 / सिफारिस र शुल्क" />

          <View style={s.qCard}>
            <QLabel num={10} ja="友人にこのアプリを勧めますか？" ne="साथीलाई यो एप सिफारिस गर्नुहुन्छ？" />
            <Radio options={Q10_OPTIONS} value={data.q10_recommend} onChange={(v) => set('q10_recommend', v)} />
          </View>

          <View style={s.qCard}>
            <QLabel num={11} ja="有料サブスク（月額）に加入しますか？" ne="सशुल्क सदस्यता लिन तयार हुनुहुन्छ？" />
            <Radio options={Q11_OPTIONS} value={data.q11_paid_sub} onChange={(v) => set('q11_paid_sub', v)} />
          </View>

          {/* ── ご意見 ── */}
          <Section title="ご意見 / सुझावहरू" />

          <View style={s.qCard}>
            <QLabel num={12} ja="アプリの良かった点は？" ne="एपको सबैभन्दा राम्रो पक्ष के हो？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={3}
              value={data.q12_good_points}
              onChangeText={(v) => set('q12_good_points', v)}
              placeholder="自由に記入 / स्वतन्त्र रूपमा लेख्नुहोस्"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={s.qCard}>
            <QLabel num={13} ja="改善してほしい点は？" ne="सुधार गर्नुपर्ने कुराहरू के छन्？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={3}
              value={data.q13_improvements}
              onChangeText={(v) => set('q13_improvements', v)}
              placeholder="自由に記入 / स्वतन्त्र रूपमा लेख्नुहोस्"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={s.qCard}>
            <QLabel num={14} ja="その他、ご意見・ご要望" ne="अन्य कुनै सुझाव वा टिप्पणी？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={3}
              value={data.q14_other}
              onChangeText={(v) => set('q14_other', v)}
              placeholder="自由に記入 / स्वतन्त्र रूपमा लेख्नुहोस्"
              placeholderTextColor="#bbb"
            />
          </View>

          {/* ── サービス利用状況 ── */}
          <Section title="サービス利用状況 / सेवा प्रयोगको अवस्था" />

          <View style={s.qCard}>
            <QLabel num={15} ja="仕事を探すときに利用したサービスは？" ne="काम खोज्दा कुन सेवा प्रयोग गर्नुभयो？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={2}
              value={data.q15_job_service}
              onChangeText={(v) => set('q15_job_service', v)}
              placeholder="例: ハローワーク / उदा: Hello Work"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={s.qCard}>
            <QLabel num={16} ja="家を探すときに利用したサービスは？" ne="घर खोज्दा कुन सेवा प्रयोग गर्नुभयो？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={2}
              value={data.q16_housing_service}
              onChangeText={(v) => set('q16_housing_service', v)}
              placeholder="例: wagaya Japan / उदा: wagaya Japan"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={s.qCard}>
            <QLabel num={17} ja="学校・日本語学校を探すときに利用したサービスは？" ne="विद्यालय खोज्दा कुन सेवा प्रयोग गर्नुभयो？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={2}
              value={data.q17_school_service}
              onChangeText={(v) => set('q17_school_service', v)}
              placeholder="例: ISI日本語学校 / उदा: ISI"
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={s.qCard}>
            <QLabel num={18} ja="困ったとき、誰に相談しましたか？" ne="समस्या आउँदा कसलाई सम्पर्क गर्नुभयो？" />
            <TextInput
              style={s.textInput}
              multiline
              numberOfLines={2}
              value={data.q18_consultation}
              onChangeText={(v) => set('q18_consultation', v)}
              placeholder="例: 友人・家族 / उदा: साथी, परिवार"
              placeholderTextColor="#bbb"
            />
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[s.submitBtn, submitting && s.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.submitJa}>送信する</Text>
                <Text style={s.submitNe}>पठाउनुहोस्</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={s.bottomPad} />
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: RED,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },

  content: { padding: 16, gap: 12 },

  section: { paddingVertical: 6, paddingHorizontal: 4, marginTop: 8 },
  sectionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  qCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    gap: 12,
  },

  qLabel: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  qNum: {
    fontSize: 11,
    fontWeight: 'bold',
    color: RED,
    backgroundColor: LIGHT_RED,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 2,
  },
  qTextBox: { flex: 1 },
  qJa: { fontSize: 14, fontWeight: '600', color: '#1a1a2e', lineHeight: 20 },
  qNe: { fontSize: 12, color: '#666', marginTop: 2, lineHeight: 18 },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starBtn: { padding: 4 },
  star: { fontSize: 30, color: '#ddd' },
  starOn: { color: '#F1C40F' },
  starScore: { fontSize: 13, color: '#888', marginLeft: 6 },

  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    minWidth: 80,
  },
  pillActive: { backgroundColor: RED, borderColor: RED },
  pillJa: { fontSize: 12, fontWeight: '600', color: '#333' },
  pillTextActive: { color: '#fff' },
  pillNe: { fontSize: 10, color: '#999', marginTop: 1 },
  pillNeActive: { color: 'rgba(255,255,255,0.8)' },

  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    minHeight: 72,
    textAlignVertical: 'top',
  },

  submitBtn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitDisabled: { backgroundColor: '#ccc' },
  submitJa: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  submitNe: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  thankYouBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  thankYouIcon: { fontSize: 60, marginBottom: 20 },
  thankYouJa: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' },
  thankYouNe: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },

  bottomPad: { height: 40 },
})
