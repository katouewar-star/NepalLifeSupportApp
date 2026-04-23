/**
 * Supabase 接続確認テスト（統合テスト）
 * 実際のDBに接続してテーブルの存在・RLS を確認する
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zycdoxlpjmqaejoprkrw.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5Y2RveGxwam1xYWVqb3Bya3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzczMzAsImV4cCI6MjA5MDU1MzMzMH0.DR6BaAwvO2jBBH8ugrJqmOR2EYXS5SP4xUQ0A0Nc4gw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

describe('Supabase 接続確認', () => {
  describe('テーブル存在確認', () => {
    it('phrasebooks テーブルにアクセスできること', async () => {
      const { error } = await supabase.from('phrasebooks').select('id').limit(1)
      expect(error).toBeNull()
    })

    it('trash_rules テーブルにアクセスできること', async () => {
      const { error } = await supabase.from('trash_rules').select('id').limit(1)
      expect(error).toBeNull()
    })

    it('jobs テーブルにアクセスできること', async () => {
      const { error } = await supabase.from('jobs').select('id').limit(1)
      expect(error).toBeNull()
    })

    it('posts テーブルにアクセスできること', async () => {
      const { error } = await supabase.from('posts').select('id').limit(1)
      expect(error).toBeNull()
    })
  })

  describe('RLS 確認（未認証）', () => {
    it('未認証でも posts を読み取れること（SELECT は公開）', async () => {
      const { data, error } = await supabase.from('posts').select('id').limit(1)
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('未認証では posts に投稿できないこと（INSERT は認証必須）', async () => {
      const { error } = await supabase.from('posts').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'テスト投稿',
        body: 'テスト本文',
        category: 'qa',
      })
      expect(error).not.toBeNull()
    })
  })
})
