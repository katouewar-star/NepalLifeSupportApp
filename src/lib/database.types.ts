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
          language: 'ne' | 'ja' | 'en'
          postal_code: string | null
          fcm_token: string | null
          role: 'admin' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          language?: 'ne' | 'ja' | 'en'
          postal_code?: string | null
          fcm_token?: string | null
          role?: 'admin' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          language?: 'ne' | 'ja' | 'en'
          postal_code?: string | null
          fcm_token?: string | null
          role?: 'admin' | 'user'
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      survey_responses: {
        Row: {
          id: number
          user_id: string | null
          q1_residence: string
          q2_japanese_level: string
          q3_usability: number
          q4_design: number
          q5_speed: number
          q6_useful_features: string[]
          q7_translation_accuracy: number
          q8_wanted_features: string[]
          q9_satisfaction: number
          q10_recommend: string
          q11_paid_sub: string
          q12_good_points: string
          q13_improvements: string
          q14_other: string
          q15_job_service: string
          q16_housing_service: string
          q17_school_service: string
          q18_consultation: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          q1_residence: string
          q2_japanese_level: string
          q3_usability: number
          q4_design: number
          q5_speed: number
          q6_useful_features: string[]
          q7_translation_accuracy: number
          q8_wanted_features: string[]
          q9_satisfaction: number
          q10_recommend: string
          q11_paid_sub: string
          q12_good_points: string
          q13_improvements: string
          q14_other: string
          q15_job_service: string
          q16_housing_service: string
          q17_school_service: string
          q18_consultation: string
          created_at?: string
        }
        Update: {
          user_id?: string | null
        }
        Relationships: []
      }
      travel_posts: {
        Row: {
          id: number
          user_id: string
          author_name: string | null
          title: string
          description: string
          location: string
          category: 'city' | 'nature' | 'culture' | 'food'
          photo_url: string | null
          photo_urls: string[]
          cost_level: 1 | 2 | 3 | null
          season_tags: string[]
          highlights: string[]
          highlight_photos: string[]
          tips: string | null
          access_info: string | null
          duration_key: string | null
          external_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          like_count: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          author_name?: string | null
          title: string
          description: string
          location: string
          category: 'city' | 'nature' | 'culture' | 'food'
          photo_url?: string | null
          photo_urls?: string[]
          cost_level?: 1 | 2 | 3 | null
          season_tags?: string[]
          highlights?: string[]
          highlight_photos?: string[]
          tips?: string | null
          access_info?: string | null
          duration_key?: string | null
          external_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          like_count?: number
          created_at?: string
        }
        Update: {
          author_name?: string | null
          title?: string
          description?: string
          location?: string
          category?: 'city' | 'nature' | 'culture' | 'food'
          photo_url?: string | null
          photo_urls?: string[]
          cost_level?: 1 | 2 | 3 | null
          season_tags?: string[]
          highlights?: string[]
          highlight_photos?: string[]
          tips?: string | null
          access_info?: string | null
          duration_key?: string | null
          external_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          like_count?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
