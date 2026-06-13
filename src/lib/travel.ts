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

export interface TravelDestination {
  id: string
  category: TravelCategory
  emoji: string
  costLevel: 1 | 2 | 3
  durationKey: DurationKey
  accessKey: AccessKey
  seasonKeys: SeasonKey[]
  highlightKeys: [string, string, string, string]
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
  },
]

export function filterDestinations(
  list: TravelDestination[],
  category: 'all' | TravelCategory
): TravelDestination[] {
  return category === 'all' ? list : list.filter((d) => d.category === category)
}
