export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          language: 'ne' | 'ja'
          postal_code: string | null
          fcm_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          language?: 'ne' | 'ja'
          postal_code?: string | null
          fcm_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          language?: 'ne' | 'ja'
          postal_code?: string | null
          fcm_token?: string | null
        }
      }
      phrasebooks: {
        Row: {
          id: number
          category: string
          ja: string
          ne: string
          sort_order: number
        }
        Insert: {
          id?: number
          category: string
          ja: string
          ne: string
          sort_order?: number
        }
        Update: {
          category?: string
          ja?: string
          ne?: string
          sort_order?: number
        }
      }
      trash_rules: {
        Row: {
          id: number
          postal_code: string
          category: string
          schedule: Json
          notes_ja: string | null
          notes_ne: string | null
          icon: string | null
        }
        Insert: {
          id?: number
          postal_code: string
          category: string
          schedule: Json
          notes_ja?: string | null
          notes_ne?: string | null
          icon?: string | null
        }
        Update: {
          postal_code?: string
          category?: string
          schedule?: Json
          notes_ja?: string | null
          notes_ne?: string | null
          icon?: string | null
        }
      }
      jobs: {
        Row: {
          id: number
          title: string
          company: string
          visa_types: string[]
          jp_level: string | null
          description_ja: string | null
          description_ne: string | null
          location: string | null
          salary_range: string | null
          url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          company: string
          visa_types: string[]
          jp_level?: string | null
          description_ja?: string | null
          description_ne?: string | null
          location?: string | null
          salary_range?: string | null
          url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          company?: string
          visa_types?: string[]
          jp_level?: string | null
          description_ja?: string | null
          description_ne?: string | null
          location?: string | null
          salary_range?: string | null
          url?: string | null
          is_active?: boolean
        }
      }
      posts: {
        Row: {
          id: number
          user_id: string
          title: string
          body: string
          category: 'qa' | 'life' | 'event'
          like_count: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          body: string
          category: 'qa' | 'life' | 'event'
          like_count?: number
          created_at?: string
        }
        Update: {
          title?: string
          body?: string
          category?: 'qa' | 'life' | 'event'
          like_count?: number
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: number
          post_id: number
          user_id: string
          body: string
          created_at?: string
        }
        Update: {
          body?: string
        }
      }
      likes: {
        Row: {
          user_id: string
          post_id: number
        }
        Insert: {
          user_id: string
          post_id: number
        }
        Update: never
      }
      reports: {
        Row: {
          id: number
          reporter_id: string
          post_id: number | null
          comment_id: number | null
          reason: string
          status: 'pending' | 'resolved' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: number
          reporter_id: string
          post_id?: number | null
          comment_id?: number | null
          reason: string
          status?: 'pending' | 'resolved' | 'dismissed'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'resolved' | 'dismissed'
        }
      }
    }
      travel_posts: {
        Row: {
          id: number
          user_id: string
          title: string
          description: string
          location: string
          category: 'city' | 'nature' | 'culture' | 'food'
          photo_url: string | null
          cost_level: 1 | 2 | 3 | null
          season_tags: string[]
          status: 'pending' | 'approved' | 'rejected'
          like_count: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          description: string
          location: string
          category: 'city' | 'nature' | 'culture' | 'food'
          photo_url?: string | null
          cost_level?: 1 | 2 | 3 | null
          season_tags?: string[]
          status?: 'pending' | 'approved' | 'rejected'
          like_count?: number
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          location?: string
          category?: 'city' | 'nature' | 'culture' | 'food'
          photo_url?: string | null
          cost_level?: 1 | 2 | 3 | null
          season_tags?: string[]
          status?: 'pending' | 'approved' | 'rejected'
          like_count?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
