ALTER TABLE travel_posts
  ADD COLUMN IF NOT EXISTS highlight_photos TEXT[] NOT NULL DEFAULT '{}';
