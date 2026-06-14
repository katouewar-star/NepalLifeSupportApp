export type TravelCategory = 'city' | 'nature' | 'culture' | 'food'

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter'

export type DurationKey = 'one' | 'oneTwo' | 'twoThree' | 'threeFour' | 'threeFive'

export type AccessKey =
  | 'local'
  | 'shinkansen215'
  | 'shinkansen230'
  | 'shinkansen240'
  | 'shinkansen300'
  | 'plane90'
  | 'plane150'
  | 'train90'

const CDN = 'https://images.unsplash.com/photo-'
const Q   = '?w=800&q=85&auto=format&fit=crop'

export interface TravelDestination {
  id: string
  category: TravelCategory
  emoji: string
  costLevel: 1 | 2 | 3
  durationKey: DurationKey
  accessKey: AccessKey
  seasonKeys: SeasonKey[]
  highlightKeys: [string, string, string, string]
  /** Unsplash CDN photo URL */
  photoUrl: string
  /** Number of plan days available in translation files */
  planDayCount: number
}

export const DESTINATIONS: TravelDestination[] = [
  {
    id: 'tokyo',
    category: 'city',
    emoji: '🗼',
    costLevel: 2,
    durationKey: 'twoThree',
    accessKey: 'local',
    seasonKeys: ['spring', 'summer', 'autumn', 'winter'],
    highlightKeys: ['shinjuku', 'asakusa', 'shibuya', 'akihabara'],
    photoUrl: CDN + '1540959733332-eab4deabeeaf' + Q,
    planDayCount: 3,
  },
  {
    id: 'kyoto',
    category: 'culture',
    emoji: '⛩️',
    costLevel: 2,
    durationKey: 'twoThree',
    accessKey: 'shinkansen215',
    seasonKeys: ['spring', 'autumn'],
    highlightKeys: ['fushimi', 'kinkakuji', 'arashiyama', 'gion'],
    photoUrl: CDN + '1493976040374-85c8e12f0c0e' + Q,
    planDayCount: 3,
  },
  {
    id: 'osaka',
    category: 'food',
    emoji: '🍜',
    costLevel: 2,
    durationKey: 'oneTwo',
    accessKey: 'shinkansen230',
    seasonKeys: ['spring', 'summer', 'autumn', 'winter'],
    highlightKeys: ['dotonbori', 'castle', 'kuromon', 'namba'],
    photoUrl: CDN + '1589452271712-64b8a66c7b71' + Q,
    planDayCount: 2,
  },
  {
    id: 'hokkaido',
    category: 'nature',
    emoji: '🏔️',
    costLevel: 3,
    durationKey: 'threeFive',
    accessKey: 'plane90',
    seasonKeys: ['summer', 'winter'],
    highlightKeys: ['sapporo', 'furano', 'otaru', 'niseko'],
    photoUrl: CDN + '1553361371-9b22f78e8b1d' + Q,
    planDayCount: 3,
  },
  {
    id: 'fuji',
    category: 'nature',
    emoji: '🗻',
    costLevel: 2,
    durationKey: 'oneTwo',
    accessKey: 'train90',
    seasonKeys: ['spring', 'summer', 'autumn'],
    highlightKeys: ['climb', 'hakone', 'kawaguchiko', 'onsen'],
    photoUrl: CDN + '1490806843957-31f4c9a91c65' + Q,
    planDayCount: 1,
  },
  {
    id: 'nara',
    category: 'culture',
    emoji: '🦌',
    costLevel: 1,
    durationKey: 'one',
    accessKey: 'shinkansen300',
    seasonKeys: ['spring', 'autumn'],
    highlightKeys: ['deer', 'todaiji', 'kasuga', 'naramachi'],
    photoUrl: CDN + '1524413840807-0c3cb6fa808d' + Q,
    planDayCount: 1,
  },
  {
    id: 'hiroshima',
    category: 'culture',
    emoji: '🕊️',
    costLevel: 2,
    durationKey: 'oneTwo',
    accessKey: 'shinkansen240',
    seasonKeys: ['spring', 'autumn'],
    highlightKeys: ['peace', 'miyajima', 'okonomiyaki', 'itsukushima'],
    photoUrl: CDN + '1528360983277-13d401cdc186' + Q,
    planDayCount: 2,
  },
  {
    id: 'okinawa',
    category: 'nature',
    emoji: '🏖️',
    costLevel: 3,
    durationKey: 'threeFour',
    accessKey: 'plane150',
    seasonKeys: ['spring', 'summer'],
    highlightKeys: ['beach', 'snorkel', 'ryukyu', 'churaumi'],
    photoUrl: CDN + '1510414842594-a61c69b5ae57' + Q,
    planDayCount: 2,
  },
]

export function filterDestinations(
  list: TravelDestination[],
  category: 'all' | TravelCategory
): TravelDestination[] {
  return category === 'all' ? list : list.filter((d) => d.category === category)
}
