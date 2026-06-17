import { supabase } from './supabase'
import type { AppLanguage, AppUser, AppSession } from '@/stores/useAuthStore'

interface AuthResult {
  user: AppUser | null
  session: AppSession | null
  error: { message: string } | null
  needsEmailConfirmation?: boolean
}

interface SignUpParams {
  email: string
  password: string
  name: string
  language: AppLanguage
}

interface SignInParams {
  email: string
  password: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8
const NAME_MAX_LENGTH = 100
const EMAIL_MAX_LENGTH = 254

export { PASSWORD_MIN_LENGTH }

export async function signUp({ email, password, name, language }: SignUpParams): Promise<AuthResult> {
  if (!EMAIL_REGEX.test(email)) {
    return { user: null, session: null, error: { message: 'メールアドレスの形式が正しくありません' } }
  }
  if (email.length > EMAIL_MAX_LENGTH) {
    return { user: null, session: null, error: { message: 'メールアドレスが長すぎます' } }
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { user: null, session: null, error: { message: `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください` } }
  }
  const trimmedName = name.trim()
  if (!trimmedName) {
    return { user: null, session: null, error: { message: '名前を入力してください' } }
  }
  if (trimmedName.length > NAME_MAX_LENGTH) {
    return { user: null, session: null, error: { message: '名前は100文字以内で入力してください' } }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: trimmedName, language },
        emailRedirectTo: 'https://nepal-life-support-app.vercel.app/confirm',
      },
    })

    if (error) {
      if (error.status === 400 && error.message.toLowerCase().includes('already registered')) {
        return { user: null, session: null, error: { message: 'このメールアドレスは既に登録されています' } }
      }
      return { user: null, session: null, error: { message: '登録に失敗しました。しばらく経ってからお試しください' } }
    }

    const user: AppUser | null = data.user
      ? { id: data.user.id, email: data.user.email ?? email, name: trimmedName, role: 'user' }
      : null

    const session: AppSession | null = data.session
      ? { accessToken: data.session.access_token, refreshToken: data.session.refresh_token }
      : null

    const needsEmailConfirmation = user !== null && session === null

    return { user, session, error: null, needsEmailConfirmation }
  } catch (e) {
    return { user: null, session: null, error: { message: '登録に失敗しました。しばらく経ってからお試しください' } }
  }
}

export async function signIn({ email, password }: SignInParams): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // 内部エラーメッセージを外に出さない（アカウント列挙防止）
      return { user: null, session: null, error: { message: 'メールアドレスまたはパスワードが正しくありません' } }
    }

    const user: AppUser | null = data.user
      ? { id: data.user.id, email: data.user.email ?? email, name: data.user.user_metadata?.name ?? '', role: 'user' }
      : null

    const session: AppSession | null = data.session
      ? { accessToken: data.session.access_token, refreshToken: data.session.refresh_token }
      : null

    return { user, session, error: null }
  } catch (e) {
    return { user: null, session: null, error: { message: 'ログインに失敗しました。しばらく経ってからお試しください' } }
  }
}

export async function resendConfirmationEmail(email: string): Promise<{ error: { message: string } | null }> {
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) return { error: { message: '再送信に失敗しました。しばらく経ってからお試しください' } }
    return { error: null }
  } catch (e) {
    return { error: { message: '再送信に失敗しました。しばらく経ってからお試しください' } }
  }
}

export async function signOut(): Promise<{ error: { message: string } | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error ? { message: 'ログアウトに失敗しました' } : null }
  } catch (e) {
    return { error: { message: 'ログアウトに失敗しました' } }
  }
}

export async function getCurrentSession(): Promise<{
  session: AppSession | null
  error: { message: string } | null
}> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) return { session: null, error: { message: 'セッション取得に失敗しました' } }

    return {
      session: data.session
        ? { accessToken: data.session.access_token, refreshToken: data.session.refresh_token }
        : null,
      error: null,
    }
  } catch (e) {
    return { session: null, error: { message: 'セッション取得に失敗しました' } }
  }
}
