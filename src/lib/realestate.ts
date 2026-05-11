export type RealEstateCategory = 'portal' | 'agency' | 'guarantee'

export interface RealEstateAgent {
  id: string
  category: RealEstateCategory
  location: string
  url: string
  tel?: string
  nepalLang: boolean
  guarantorFree: boolean
  isVerified: boolean
  verifiedAt: string
}

export const REAL_ESTATE_AGENTS: RealEstateAgent[] = [
  {
    id: 'wagaya-japan',
    category: 'portal',
    location: '全国対応',
    url: 'https://wagaya-japan.com/jp/',
    nepalLang: true,
    guarantorFree: true,
    isVerified: true,
    verifiedAt: '2024-12-01',
  },
  {
    id: 'bridge-life',
    category: 'agency',
    location: '東京都',
    url: 'https://bridgelife-japan.com/',
    nepalLang: true,
    guarantorFree: false,
    isVerified: true,
    verifiedAt: '2024-11-15',
  },
  {
    id: 'gtn',
    category: 'guarantee',
    location: '全国対応',
    url: 'https://www.gtn.co.jp/',
    nepalLang: true,
    guarantorFree: false,
    isVerified: true,
    verifiedAt: '2024-11-01',
  },
  {
    id: 'best-estate',
    category: 'portal',
    location: '全国対応',
    url: 'https://www.best-estate.jp/en/',
    nepalLang: false,
    guarantorFree: true,
    isVerified: true,
    verifiedAt: '2024-10-01',
  },
  {
    id: 'leopalace21',
    category: 'agency',
    location: '全国対応',
    url: 'https://www.leopalace21.com/',
    nepalLang: false,
    guarantorFree: true,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'suumo',
    category: 'portal',
    location: '全国対応',
    url: 'https://suumo.jp/',
    nepalLang: false,
    guarantorFree: false,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
]

export function filterAgents(
  agents: RealEstateAgent[],
  category: RealEstateCategory | 'all'
): RealEstateAgent[] {
  if (category === 'all') return agents
  return agents.filter((a) => a.category === category)
}
