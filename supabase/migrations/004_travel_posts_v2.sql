-- ── travel_posts リッチコンテンツ対応 ─────────────────────────────────────────

ALTER TABLE travel_posts
  ADD COLUMN IF NOT EXISTS photo_urls  TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS highlights  TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tips        TEXT,
  ADD COLUMN IF NOT EXISTS access_info TEXT,
  ADD COLUMN IF NOT EXISTS duration_key TEXT;

-- 既存の photo_url を photo_urls[1] に移行
UPDATE travel_posts
SET photo_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL
  AND photo_url <> ''
  AND array_length(photo_urls, 1) IS NULL;

-- language 制約に 'en' を追加（バグ修正）
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_language_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_language_check
  CHECK (language IN ('ne', 'ja', 'en'));
