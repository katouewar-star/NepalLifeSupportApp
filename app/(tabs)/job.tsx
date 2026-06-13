import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { JOB_AGENCIES, filterAgencies, AgencyCategory, JobAgency } from '../../src/lib/job'

type FilterValue = 'all' | AgencyCategory

const RED = '#c0392b'
const LIGHT_RED = '#fdecea'
const PUBLIC_COLOR = '#1a5276'
const PRIVATE_COLOR = '#7d6608'

export default function JobScreen() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selected, setSelected] = useState<JobAgency | null>(null)

  const agencies = filterAgencies(JOB_AGENCIES, filter)

  const filters: { key: FilterValue; label: string }[] = [
    { key: 'all',     label: t('job.filterAll')     },
    { key: 'public',  label: t('job.filterPublic')  },
    { key: 'private', label: t('job.filterPrivate') },
  ]

  return (
    <View style={s.wrapper}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('job.title')}</Text>
      </View>

      {/* ── Filter tabs ── */}
      <View style={s.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterBtn, filter === f.key && s.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[s.filterText, filter === f.key && s.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Agency list ── */}
      <ScrollView contentContainerStyle={s.list}>
        {agencies.length === 0 ? (
          <Text style={s.noResults}>{t('job.noResults')}</Text>
        ) : (
          agencies.map((agency) => {
            const isPublic = agency.category === 'public'
            const accentColor = isPublic ? PUBLIC_COLOR : PRIVATE_COLOR
            return (
              <TouchableOpacity
                key={agency.id}
                style={s.card}
                onPress={() => setSelected(agency)}
                activeOpacity={0.78}
              >
                <View style={[s.cardBar, { backgroundColor: accentColor }]} />
                <View style={s.cardInner}>
                  <View style={s.cardTop}>
                    <View style={[s.iconBox, { backgroundColor: accentColor + '18' }]}>
                      <Text style={s.cardIcon}>{isPublic ? '🏛️' : '🏢'}</Text>
                    </View>
                    <View style={s.cardTitleArea}>
                      <Text style={s.cardName}>{t(`job.agencies.${agency.id}.name`)}</Text>
                      <View style={s.badges}>
                        <View style={[s.badge, { backgroundColor: accentColor + '22' }]}>
                          <Text style={[s.badgeText, { color: accentColor }]}>
                            {isPublic ? t('job.filterPublic') : t('job.filterPrivate')}
                          </Text>
                        </View>
                        <View style={[s.badge, agency.isVerified ? s.badgeVerified : s.badgePending]}>
                          <Text style={s.badgeText}>
                            {agency.isVerified ? `✅ ${t('job.verified')}` : `⏳ ${t('job.pending')}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={s.chevron}>›</Text>
                  </View>

                  <Text style={s.cardNote} numberOfLines={2}>
                    {t(`job.agencies.${agency.id}.note`)}
                  </Text>

                  <View style={s.cardMeta}>
                    <Text style={s.metaText}>🛂 {agency.visaTypes.join('・')}</Text>
                    {agency.tel && (
                      <Text style={s.metaText}>📞 {agency.tel}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>⚠ {t('job.disclaimer')}</Text>
        </View>
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <AgencyDetail agency={selected} onClose={() => setSelected(null)} />
        )}
      </Modal>
    </View>
  )
}

function AgencyDetail({
  agency,
  onClose,
}: {
  agency: JobAgency
  onClose: () => void
}) {
  const { t } = useTranslation()
  const isPublic = agency.category === 'public'
  const accentColor = isPublic ? PUBLIC_COLOR : PRIVATE_COLOR
  const lightBg = isPublic ? '#EAF2F8' : '#FEF9E7'

  const steps = Array.from({ length: agency.stepCount }, (_, i) =>
    t(`job.agencies.${agency.id}.step${i + 1}`)
  )

  return (
    <View style={d.wrapper}>
      {/* ── Hero header ── */}
      <View style={[d.hero, { backgroundColor: accentColor }]}>
        <View style={d.heroCircle} />
        <TouchableOpacity style={d.backBtn} onPress={onClose}>
          <Text style={d.backBtnText}>← {t('job.detailBack')}</Text>
        </TouchableOpacity>
        <Text style={d.heroIcon}>{isPublic ? '🏛️' : '🏢'}</Text>
        <Text style={d.heroName}>{t(`job.agencies.${agency.id}.name`)}</Text>
        <View style={d.heroBadgeRow}>
          <View style={d.heroBadge}>
            <Text style={d.heroBadgeText}>
              {isPublic ? t('job.filterPublic') : t('job.filterPrivate')}
            </Text>
          </View>
          <View style={[d.heroBadge, { backgroundColor: agency.isVerified ? '#27ae6044' : '#e67e2244' }]}>
            <Text style={d.heroBadgeText}>
              {agency.isVerified ? `✅ ${t('job.verified')}` : `⏳ ${t('job.pending')}`}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={d.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Summary ── */}
        <View style={d.section}>
          <Text style={[d.sectionTitle, { color: accentColor }]}>
            📋 {t('job.detailSummaryLabel')}
          </Text>
          <Text style={d.summaryText}>{t(`job.agencies.${agency.id}.summary`)}</Text>
        </View>

        {/* ── Contact info ── */}
        <View style={[d.section, d.contactBox, { backgroundColor: lightBg }]}>
          <Text style={[d.sectionTitle, { color: accentColor }]}>
            📞 {t('job.detailContactLabel')}
          </Text>
          {agency.tel && (
            <View style={d.contactRow}>
              <Text style={d.contactIcon}>📱</Text>
              <Text style={d.contactLabel}>{t('job.telLabel')}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${agency.tel}`)}>
                <Text style={[d.contactValue, { color: accentColor }]}>{agency.tel}</Text>
              </TouchableOpacity>
            </View>
          )}
          {agency.hours && (
            <View style={d.contactRow}>
              <Text style={d.contactIcon}>🕐</Text>
              <Text style={d.contactLabel}>{t('job.hoursLabel')}</Text>
              <Text style={d.contactValue}>{agency.hours}</Text>
            </View>
          )}
          {agency.permitNumber && (
            <View style={d.contactRow}>
              <Text style={d.contactIcon}>📄</Text>
              <Text style={d.contactLabel}>{t('job.detailPermitLabel')}</Text>
              <Text style={d.contactValue}>{agency.permitNumber}</Text>
            </View>
          )}
          {agency.supportNumber && (
            <View style={d.contactRow}>
              <Text style={d.contactIcon}>🔖</Text>
              <Text style={d.contactLabel}>{t('job.detailSupportLabel')}</Text>
              <Text style={d.contactValue}>{agency.supportNumber}</Text>
            </View>
          )}
          <View style={d.contactRow}>
            <Text style={d.contactIcon}>🛂</Text>
            <Text style={d.contactLabel}>{t('job.visaLabel')}</Text>
            <Text style={d.contactValue}>{agency.visaTypes.join('・')}</Text>
          </View>
          <View style={d.contactRow}>
            <Text style={d.contactIcon}>🌐</Text>
            <Text style={d.contactLabel}>{t('job.langLabel')}</Text>
            <Text style={d.contactValue}>{agency.languages.join('・')}</Text>
          </View>
        </View>

        {/* ── Steps ── */}
        <View style={d.section}>
          <Text style={[d.sectionTitle, { color: accentColor }]}>
            📝 {t('job.detailStepsLabel')}
          </Text>
          {steps.map((step, i) => (
            <View key={i} style={d.stepRow}>
              <View style={[d.stepNum, { backgroundColor: accentColor }]}>
                <Text style={d.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={d.stepText}>{step}</Text>
              {i < steps.length - 1 && (
                <View style={[d.stepConnector, { backgroundColor: accentColor + '33' }]} />
              )}
            </View>
          ))}
        </View>

        {/* ── Official site button ── */}
        <TouchableOpacity
          style={[d.urlBtn, !agency.isVerified && d.urlBtnDisabled, { backgroundColor: accentColor }]}
          onPress={() => { if (agency.isVerified) Linking.openURL(agency.url) }}
          disabled={!agency.isVerified}
        >
          <Text style={d.urlBtnText}>🔗 {t('job.openUrl')}</Text>
        </TouchableOpacity>

        {/* ── Disclaimer ── */}
        <View style={d.disclaimer}>
          <Text style={d.disclaimerText}>⚠ {t('job.disclaimer')}</Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  )
}

// ─────────────── Styles ───────────────

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: RED,
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: RED, borderColor: RED },
  filterText: { fontSize: 13, color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  list: { padding: 16, gap: 12 },
  noResults: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 14 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardBar: { width: 5 },
  cardInner: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardTitleArea: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 5 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeVerified: { backgroundColor: '#eafaf1' },
  badgePending:  { backgroundColor: '#fef5e4' },
  badgeText: { fontSize: 10, color: '#333', fontWeight: '600' },
  chevron: { fontSize: 22, color: '#ccc', marginTop: 2 },
  cardNote: { fontSize: 12, color: '#777', lineHeight: 17, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 11, color: '#888' },

  disclaimer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: LIGHT_RED,
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 12, color: '#7b241c', lineHeight: 18 },
})

const d = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },

  hero: {
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  heroIcon: { fontSize: 56, marginBottom: 10 },
  heroName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroBadgeRow: { flexDirection: 'row', gap: 8 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  scroll: { flex: 1, backgroundColor: '#F8FAFF' },

  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  summaryText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 23,
  },

  contactBox: { borderRadius: 0 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactIcon: { fontSize: 14, width: 20 },
  contactLabel: { fontSize: 12, color: '#888', width: 90 },
  contactValue: { fontSize: 13, color: '#1a1a2e', fontWeight: '600', flex: 1 },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
    position: 'relative',
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  stepText: { fontSize: 14, color: '#333', flex: 1, lineHeight: 22, paddingTop: 3 },
  stepConnector: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: 14,
  },

  urlBtn: {
    margin: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  urlBtnDisabled: { backgroundColor: '#ccc' },
  urlBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  disclaimer: {
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: LIGHT_RED,
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 11, color: '#7b241c', lineHeight: 17 },
})
