import { supabase } from './supabase'

export interface SurveyData {
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
}

export const INITIAL_SURVEY: SurveyData = {
  q1_residence: '',
  q2_japanese_level: '',
  q3_usability: 0,
  q4_design: 0,
  q5_speed: 0,
  q6_useful_features: [],
  q7_translation_accuracy: 0,
  q8_wanted_features: [],
  q9_satisfaction: 0,
  q10_recommend: '',
  q11_paid_sub: '',
  q12_good_points: '',
  q13_improvements: '',
  q14_other: '',
  q15_job_service: '',
  q16_housing_service: '',
  q17_school_service: '',
  q18_consultation: '',
}

export const Q1_OPTIONS = [
  { value: 'under6m', ja: '6ヶ月未満',  ne: '६ महिनाभन्दा कम' },
  { value: '6m1y',    ja: '6ヶ月〜1年', ne: '६ महिना–१ वर्ष' },
  { value: '1y3y',    ja: '1〜3年',     ne: '१–३ वर्ष' },
  { value: '3y5y',    ja: '3〜5年',     ne: '३–५ वर्ष' },
  { value: 'over5y',  ja: '5年以上',    ne: '५ वर्षभन्दा बढी' },
]

export const Q2_OPTIONS = [
  { value: 'none',     ja: '全く話せない',   ne: 'बिल्कुल बोल्न सक्दिन' },
  { value: 'basic',    ja: '少し話せる',     ne: 'अलिकति बोल्छु' },
  { value: 'daily',    ja: '日常会話レベル', ne: 'दैनिक कुराकानी' },
  { value: 'business', ja: 'ビジネスレベル', ne: 'व्यावसायिक स्तर' },
  { value: 'fluent',   ja: '流暢',          ne: 'धाराप्रवाह' },
]

export const Q6_OPTIONS = [
  { value: 'translation', ja: '翻訳',        ne: 'अनुवाद' },
  { value: 'train',       ja: '電車案内',    ne: 'रेल मार्गदर्शन' },
  { value: 'job',         ja: '求人',        ne: 'रोजगारी' },
  { value: 'school',      ja: '学校',        ne: 'विद्यालय' },
  { value: 'realestate',  ja: '住まい',      ne: 'घर खोजी' },
  { value: 'trash',       ja: 'ゴミ出し',    ne: 'फोहोर' },
  { value: 'community',   ja: 'コミュニティ', ne: 'समुदाय' },
  { value: 'visa',        ja: 'ビザ情報',    ne: 'भिसा' },
]

export const Q8_OPTIONS = [
  { value: 'voice',   ja: '音声翻訳',      ne: 'आवाज अनुवाद' },
  { value: 'scan',    ja: 'スキャン翻訳',  ne: 'स्क्यान अनुवाद' },
  { value: 'chatbot', ja: 'チャットボット', ne: 'च्याटबट' },
  { value: 'study',   ja: '語学学習',      ne: 'भाषा अध्ययन' },
  { value: 'other',   ja: 'その他',        ne: 'अन्य' },
]

export const Q10_OPTIONS = [
  { value: 'yes',   ja: 'はい',  ne: 'हो' },
  { value: 'maybe', ja: '多分',  ne: 'सायद' },
  { value: 'no',    ja: 'いいえ', ne: 'होइन' },
]

export const Q11_OPTIONS = [
  { value: 'yes',   ja: 'はい',  ne: 'हो' },
  { value: 'maybe', ja: '多分',  ne: 'सायद' },
  { value: 'no',    ja: 'いいえ', ne: 'होइन' },
]

export async function submitSurvey(data: SurveyData, userId?: string): Promise<void> {
  const { error } = await supabase.from('survey_responses').insert({
    user_id: userId ?? null,
    q1_residence: data.q1_residence,
    q2_japanese_level: data.q2_japanese_level,
    q3_usability: data.q3_usability,
    q4_design: data.q4_design,
    q5_speed: data.q5_speed,
    q6_useful_features: data.q6_useful_features,
    q7_translation_accuracy: data.q7_translation_accuracy,
    q8_wanted_features: data.q8_wanted_features,
    q9_satisfaction: data.q9_satisfaction,
    q10_recommend: data.q10_recommend,
    q11_paid_sub: data.q11_paid_sub,
    q12_good_points: data.q12_good_points,
    q13_improvements: data.q13_improvements,
    q14_other: data.q14_other,
    q15_job_service: data.q15_job_service,
    q16_housing_service: data.q16_housing_service,
    q17_school_service: data.q17_school_service,
    q18_consultation: data.q18_consultation,
  })
  if (error) throw error
}
