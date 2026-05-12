export type VisaCategory = 'type' | 'office' | 'support'

export interface VisaInfo {
  id: string
  category: VisaCategory
  location: string
  url: string
  tel?: string
  isVerified: boolean
  verifiedAt: string
}

export const VISA_ITEMS: VisaInfo[] = [
  {
    id: 'specified-skilled',
    category: 'type',
    location: '全国',
    url: 'https://www.moj.go.jp/isa/applications/status/tokutei.html',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'student-visa',
    category: 'type',
    location: '全国',
    url: 'https://www.moj.go.jp/isa/applications/status/ryugaku.html',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'engineer-visa',
    category: 'type',
    location: '全国',
    url: 'https://www.moj.go.jp/isa/applications/status/gijinkoku.html',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'immigration-agency',
    category: 'office',
    location: '全国',
    url: 'https://www.moj.go.jp/isa/',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'tokyo-immigration',
    category: 'office',
    location: '東京都港区',
    url: 'https://www.moj.go.jp/isa/about/region/tokyo/index.html',
    tel: '0570-034259',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'nepal-embassy',
    category: 'support',
    location: '東京都品川区',
    url: 'https://jp.nepalembassy.gov.np/',
    tel: '03-3705-5558',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'gyoseishoshi',
    category: 'support',
    location: '全国',
    url: 'https://www.gyosei.or.jp/',
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
]

export function filterVisaItems(
  items: VisaInfo[],
  category: VisaCategory | 'all'
): VisaInfo[] {
  if (category === 'all') return items
  return items.filter((item) => item.category === category)
}
