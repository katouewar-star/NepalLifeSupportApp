export type AgencyCategory = 'public' | 'private'
export type VisaType = '特定技能' | '技人国' | '留学' | '全般'

export interface JobAgency {
  id: string
  category: AgencyCategory
  visaTypes: VisaType[]
  languages: string[]
  url: string
  tel?: string
  hours?: string
  permitNumber?: string
  supportNumber?: string
  isVerified: boolean
  verifiedAt: string
}

export const JOB_AGENCIES: JobAgency[] = [
  {
    id: 'tokyo-foreigner',
    category: 'public',
    visaTypes: ['全般'],
    languages: ['ネパール語', '日本語'],
    url: 'https://tokyo-foreigner.jsite.mhlw.go.jp/',
    tel: '03-5339-8626',
    hours: '平日 9:30〜17:15',
    isVerified: true,
    verifiedAt: '2024-12-01',
  },
  {
    id: 'lead-to-japan',
    category: 'private',
    visaTypes: ['特定技能', '技人国'],
    languages: ['ネパール語', '日本語'],
    url: 'https://www.leadtojapan.jp/',
    permitNumber: '13-ユ-311955',
    supportNumber: '19登-000250',
    isVerified: true,
    verifiedAt: '2024-11-15',
  },
  {
    id: 'sherpa',
    category: 'private',
    visaTypes: ['特定技能', '留学'],
    languages: ['ネパール語', '日本語'],
    url: 'https://sherpa.ne.jp/',
    supportNumber: '20登-001234',
    isVerified: true,
    verifiedAt: '2024-10-20',
  },
  {
    id: 'sapna',
    category: 'private',
    visaTypes: ['特定技能', '技人国', '留学'],
    languages: ['ネパール語', '日本語'],
    url: 'https://sapna.jp/',
    isVerified: false,
    verifiedAt: '2024-09-01',
  },
]

export function filterAgencies(
  agencies: JobAgency[],
  category: AgencyCategory | 'all'
): JobAgency[] {
  if (category === 'all') return agencies
  return agencies.filter((a) => a.category === category)
}
