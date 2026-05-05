export type SchoolCategory = 'language' | 'vocational' | 'university' | 'agent'

export interface School {
  id: string
  category: SchoolCategory
  location: string
  url: string
  tel?: string
  visaSupport: boolean
  nepalStaff: boolean
  isVerified: boolean
  verifiedAt: string
}

export const SCHOOLS: School[] = [
  {
    id: 'isi',
    category: 'language',
    location: '東京都新宿区',
    url: 'https://www.isi-education.com/',
    visaSupport: true,
    nepalStaff: false,
    isVerified: true,
    verifiedAt: '2024-12-01',
  },
  {
    id: 'akamonkai',
    category: 'language',
    location: '東京都文京区',
    url: 'https://www.akamonkai.ac.jp/',
    visaSupport: true,
    nepalStaff: false,
    isVerified: true,
    verifiedAt: '2024-11-01',
  },
  {
    id: 'sendagaya',
    category: 'language',
    location: '東京都渋谷区',
    url: 'https://group.jp-sji.org/',
    visaSupport: true,
    nepalStaff: false,
    isVerified: true,
    verifiedAt: '2024-10-01',
  },
  {
    id: 'nepal-and-japan',
    category: 'agent',
    location: '東京都',
    url: 'https://www.nepa-nepalandjapan.com/',
    visaSupport: true,
    nepalStaff: true,
    isVerified: true,
    verifiedAt: '2024-11-15',
  },
]

export function filterSchools(
  schools: School[],
  category: SchoolCategory | 'all'
): School[] {
  if (category === 'all') return schools
  return schools.filter((s) => s.category === category)
}
