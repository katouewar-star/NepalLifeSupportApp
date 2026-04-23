-- =============================================
-- Nepal Life Support App — 初期スキーマ
-- Migration: 001_initial_schema.sql
-- =============================================

-- ユーザープロフィール（Supabase Auth と紐付け）
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'ne' CHECK (language IN ('ne', 'ja')),
  postal_code TEXT,
  fcm_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- フレーズ集（マスターデータ）
CREATE TABLE public.phrasebooks (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,  -- 'hospital', 'office', 'shopping', 'workplace', 'emergency'
  ja TEXT NOT NULL,
  ne TEXT NOT NULL,
  sort_order INT DEFAULT 0
);
CREATE INDEX idx_phrasebook_category ON public.phrasebooks(category);

-- ゴミ出しルール
CREATE TABLE public.trash_rules (
  id SERIAL PRIMARY KEY,
  postal_code TEXT NOT NULL,
  category TEXT NOT NULL,
  schedule JSONB NOT NULL,  -- {"dayOfWeek": [1,4], "weekType": "every"}
  notes_ja TEXT,
  notes_ne TEXT,
  icon TEXT
);
CREATE INDEX idx_trash_postal ON public.trash_rules(postal_code);

-- 求人情報
CREATE TABLE public.jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  visa_types TEXT[] NOT NULL,
  jp_level TEXT,  -- 'N1'〜'N5', '不問'
  description_ja TEXT,
  description_ne TEXT,
  location TEXT,
  salary_range TEXT,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_jobs_visa ON public.jobs USING GIN(visa_types);
CREATE INDEX idx_jobs_active ON public.jobs(is_active, created_at DESC);

-- コミュニティ掲示板
CREATE TABLE public.posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('qa', 'life', 'event')),
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_posts_category ON public.posts(category, created_at DESC);

-- コメント
CREATE TABLE public.comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_comments_post ON public.comments(post_id, created_at);

-- いいね（重複防止）
CREATE TABLE public.likes (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id INT REFERENCES public.posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

-- 通報
CREATE TABLE public.reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID REFERENCES public.users(id),
  post_id INT REFERENCES public.posts(id),
  comment_id INT REFERENCES public.comments(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- users: 本人のみ更新可、全員閲覧可
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- posts: 全員閲覧可、本人のみ更新・削除可
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_auth" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- comments: 全員閲覧可、本人のみ更新・削除可
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- likes: 全員閲覧可、本人のみ追加・削除可
CREATE POLICY "likes_select_all" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_auth" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- reports: 本人の通報のみ閲覧・追加可
CREATE POLICY "reports_insert_auth" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- =============================================
-- Auth トリガー: 新規ユーザー登録時に users を自動作成
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'language', 'ne')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
