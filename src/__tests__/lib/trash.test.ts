/**
 * ゴミ出しルール lib ユニットテスト（Supabase をモック）
 */

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

import { supabase } from '@/lib/supabase'
import { fetchTrashRules, toDisplayRules, formatWeekOfMonth } from '@/lib/trash'
import type { TrashRule } from '@/lib/trash'

const mockFrom = supabase.from as jest.Mock

const makeChain = (result: { data: any; error: any }) => ({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue(result),
  }),
})

const sampleRule: TrashRule = {
  id: 1,
  postal_code: '1600022',
  category: '燃えるゴミ',
  schedule: { dayOfWeek: [2, 5], time: '08:00' },
  notes_ja: '火曜・金曜の朝8時までに出してください',
  notes_ne: 'मंगलबार र शुक्रबार बिहान ८ बजेसम्म राख्नुहोस्',
  icon: '🔥',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('fetchTrashRules', () => {
  it('正常にルールを取得できること', async () => {
    mockFrom.mockReturnValue(makeChain({ data: [sampleRule], error: null }))

    const result = await fetchTrashRules('160-0022')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.rules).toHaveLength(1)
      expect(result.rules[0].category).toBe('燃えるゴミ')
    }
  })

  it('ハイフンを除去してクエリすること', async () => {
    const chain = makeChain({ data: [sampleRule], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTrashRules('160-0022')

    expect(mockFrom).toHaveBeenCalledWith('trash_rules')
    expect(chain.select().eq).toHaveBeenCalledWith('postal_code', '1600022')
  })

  it('ハイフンなし郵便番号でもクエリできること', async () => {
    const chain = makeChain({ data: [sampleRule], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchTrashRules('1600022')

    expect(chain.select().eq).toHaveBeenCalledWith('postal_code', '1600022')
  })

  it('データが0件の場合 NOT_FOUND を返すこと', async () => {
    mockFrom.mockReturnValue(makeChain({ data: [], error: null }))

    const result = await fetchTrashRules('1234567')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('NOT_FOUND')
    }
  })

  it('Supabase エラー時にエラーメッセージを返すこと', async () => {
    mockFrom.mockReturnValue(
      makeChain({ data: null, error: { message: 'DB接続エラー' } })
    )

    const result = await fetchTrashRules('1600022')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('DB接続エラー')
    }
  })

  it('例外発生時にエラーを返すこと', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('Network error')
    })

    const result = await fetchTrashRules('1600022')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Network error')
    }
  })
})

describe('toDisplayRules', () => {
  it('日本語モードでは notes_ja を使うこと', () => {
    const display = toDisplayRules([sampleRule], 'ja')

    expect(display[0].notes).toBe(sampleRule.notes_ja)
  })

  it('ネパール語モードでは notes_ne を使うこと', () => {
    const display = toDisplayRules([sampleRule], 'ne')

    expect(display[0].notes).toBe(sampleRule.notes_ne)
  })

  it('日本語モードの曜日名が正しいこと', () => {
    const display = toDisplayRules([sampleRule], 'ja')  // dayOfWeek: [2,5]

    expect(display[0].dayLabels).toEqual(['火', '金'])
  })

  it('ネパール語モードの曜日名が正しいこと', () => {
    const display = toDisplayRules([sampleRule], 'ne')  // dayOfWeek: [2,5]

    expect(display[0].dayLabels).toEqual(['मंगल', 'शुक्र'])
  })

  it('icon と category がそのままコピーされること', () => {
    const display = toDisplayRules([sampleRule], 'ja')

    expect(display[0].icon).toBe('🔥')
    expect(display[0].category).toBe('燃えるゴミ')
  })

  it('全曜日の日本語曜日名が正しいこと', () => {
    const rule: TrashRule = {
      ...sampleRule,
      schedule: { dayOfWeek: [0, 1, 2, 3, 4, 5, 6] },
    }
    const display = toDisplayRules([rule], 'ja')

    expect(display[0].dayLabels).toEqual(['日', '月', '火', '水', '木', '金', '土'])
  })
})

describe('formatWeekOfMonth', () => {
  it('日本語: 第1・第3 週を正しくフォーマットすること', () => {
    expect(formatWeekOfMonth([1, 3], 'ja')).toBe('第1・第3')
  })

  it('日本語: 第2 週を正しくフォーマットすること', () => {
    expect(formatWeekOfMonth([2], 'ja')).toBe('第2')
  })

  it('ネパール語: 第1・第3 週を正しくフォーマットすること', () => {
    expect(formatWeekOfMonth([1, 3], 'ne')).toBe('पहिलो र तेस्रो')
  })

  it('ネパール語: 第2 週を正しくフォーマットすること', () => {
    expect(formatWeekOfMonth([2], 'ne')).toBe('दोस्रो')
  })

  it('undefined の場合は空文字を返すこと', () => {
    expect(formatWeekOfMonth(undefined, 'ja')).toBe('')
  })

  it('空配列の場合は空文字を返すこと', () => {
    expect(formatWeekOfMonth([], 'ja')).toBe('')
  })
})
