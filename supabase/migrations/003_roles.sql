-- ── ユーザーロール ─────────────────────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('admin', 'user'));

-- ── 管理者チェック関数（SECURITY DEFINER で RLS を回避） ──────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

-- ── travel_posts への追加 RLS ──────────────────────────────────────────────────

-- 投稿者本人が自分の投稿を編集可
CREATE POLICY "owner can update own travel post"
  ON travel_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 管理者は任意の投稿を編集可
CREATE POLICY "admin can update any travel post"
  ON travel_posts FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 管理者は任意の投稿を削除可
CREATE POLICY "admin can delete any travel post"
  ON travel_posts FOR DELETE
  USING (public.is_admin());
