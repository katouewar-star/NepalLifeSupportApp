export type PizzaCategory = 'chain' | 'delivery' | 'parttime'

export interface PizzaShop {
  id: string
  category: PizzaCategory
  location: string
  url: string
  tel?: string
  nepalLang: boolean
  isVerified: boolean
  verifiedAt: string
}

export const PIZZA_SHOPS: PizzaShop[] = [
  {
    id: 'pizza-hut',
    category: 'chain',
    location: '全国',
    url: 'https://www.pizzahut.jp/',
    nepalLang: false,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'dominos',
    category: 'chain',
    location: '全国',
    url: 'https://www.dominos.jp/',
    nepalLang: false,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'uber-eats',
    category: 'delivery',
    location: '全国',
    url: 'https://www.ubereats.com/jp',
    nepalLang: false,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'demaecan',
    category: 'delivery',
    location: '全国',
    url: 'https://demae-can.com/',
    nepalLang: false,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
  {
    id: 'pizza-hut-job',
    category: 'parttime',
    location: '全国',
    url: 'https://www.baitoru.com/search/pizza/',
    nepalLang: false,
    isVerified: true,
    verifiedAt: '2025-01-01',
  },
]

export function filterShops(
  shops: PizzaShop[],
  category: PizzaCategory | 'all'
): PizzaShop[] {
  if (category === 'all') return shops
  return shops.filter((s) => s.category === category)
}
