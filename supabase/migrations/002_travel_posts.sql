-- ── travel_posts table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS travel_posts (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  location    TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('city', 'nature', 'culture', 'food')),
  photo_url   TEXT,
  cost_level  INT CHECK (cost_level IN (1, 2, 3)),
  season_tags TEXT[] DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'approved'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  like_count  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS travel_posts_status_idx ON travel_posts(status);
CREATE INDEX IF NOT EXISTS travel_posts_category_idx ON travel_posts(category);
CREATE INDEX IF NOT EXISTS travel_posts_created_at_idx ON travel_posts(created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE travel_posts ENABLE ROW LEVEL SECURITY;

-- 承認済み投稿は誰でも閲覧可
CREATE POLICY "approved travel posts are public"
  ON travel_posts FOR SELECT
  USING (status = 'approved');

-- 自分の投稿は自分で閲覧可（pending含む）
CREATE POLICY "owner can view own travel posts"
  ON travel_posts FOR SELECT
  USING (auth.uid() = user_id);

-- ログインユーザーは投稿可
CREATE POLICY "authenticated users can insert travel posts"
  ON travel_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 自分の投稿は削除可
CREATE POLICY "owner can delete own travel posts"
  ON travel_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ── Storage bucket for travel photos ───────────────────────────────────────
-- Run this in Supabase Dashboard > Storage (or via API):
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('travel-photos', 'travel-photos', true);
--
--   CREATE POLICY "anyone can read travel photos"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'travel-photos');
--
--   CREATE POLICY "authenticated users can upload travel photos"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (
--       bucket_id = 'travel-photos'
--       AND (storage.foldername(name))[1] = auth.uid()::text
--     );
--
--   CREATE POLICY "owner can delete own travel photos"
--     ON storage.objects FOR DELETE
--     USING (
--       bucket_id = 'travel-photos'
--       AND (storage.foldername(name))[1] = auth.uid()::text
--     );
