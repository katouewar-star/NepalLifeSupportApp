import { supabase } from './supabase'
import type { AppLanguage } from '../stores/useAuthStore'

export interface TrashSchedule {
  dayOfWeek: number[]       // 0=日〜6=土
  weekOfMonth?: number[]    // 省略=毎週, [1,3]=第1・第3週
  time?: string             // "08:00"
}

export interface TrashRule {
  id: number
  postal_code: string
  category: string
  schedule: TrashSchedule
  notes_ja: string
  notes_ne: string
  icon: string
}

export interface TrashRuleDisplay {
  id: number
  category: string
  schedule: TrashSchedule
  notes: string
  icon: string
  dayLabels: string[]
}

export type FetchTrashRulesResult =
  | { ok: true; rules: TrashRule[] }
  | { ok: false; error: string }   // 'NOT_FOUND' | エラーメッセージ

const DAY_NAMES_JA = ['日', '月', '火', '水', '木', '金', '土']
const DAY_NAMES_NE = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि']

const WEEK_ORDINALS_JA = ['', '第1', '第2', '第3', '第4', '第5']
const WEEK_ORDINALS_NE = ['', 'पहिलो', 'दोस्रो', 'तेस्रो', 'चौथो', 'पाँचौं']

export async function fetchTrashRules(postalCode: string): Promise<FetchTrashRulesResult> {
  const normalized = postalCode.replace(/-/g, '')

  try {
    const { data, error } = await supabase
      .from('trash_rules')
      .select('*')
      .eq('postal_code', normalized)

    if (error) {
      return { ok: false, error: error.message }
    }

    if (!data || data.length === 0) {
      return { ok: false, error: 'NOT_FOUND' }
    }

    return { ok: true, rules: data as TrashRule[] }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '取得に失敗しました'
    return { ok: false, error: msg }
  }
}

export function formatWeekOfMonth(
  weekOfMonth: number[] | undefined,
  language: AppLanguage
): string {
  if (!weekOfMonth || weekOfMonth.length === 0) return ''

  const ordinals = language === 'ja' ? WEEK_ORDINALS_JA : WEEK_ORDINALS_NE
  const separator = language === 'ja' ? '・' : ' र '

  return weekOfMonth.map((w) => ordinals[w] ?? String(w)).join(separator)
}

export function toDisplayRules(rules: TrashRule[], language: AppLanguage): TrashRuleDisplay[] {
  const dayNames = language === 'ja' ? DAY_NAMES_JA : DAY_NAMES_NE

  return rules.map((rule) => ({
    id: rule.id,
    category: rule.category,
    schedule: rule.schedule,
    notes: language === 'ja' ? rule.notes_ja : rule.notes_ne,
    icon: rule.icon,
    dayLabels: rule.schedule.dayOfWeek.map((d) => dayNames[d] ?? String(d)),
  }))
}
