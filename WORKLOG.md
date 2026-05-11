# 作業ログ - ネパール生活支援アプリ

最終更新: 2026-05-11

---

## 進捗サマリー

| # | フェーズ | 内容 | 状態 | 完了日 |
|---|---------|------|------|--------|
| 1 | Phase 1 | ピザサポート画面 | ✅ 完了 | 2026-05-11 |
| 2 | Phase 2 | 求人・不動産サイト情報充実 | ✅ 完了 | 2026-05-11 |
| 3 | Phase 3 | ネパール語アンケート（18問） | ✅ 完了 | 2026-05-11 |
| 4 | Phase 4 | AIチャットボット | ✅ 完了 | 2026-05-11 |
| 5 | Phase 5 | 語学学習（フラッシュカード） | ✅ 完了 | 2026-05-11 |
| 6 | Phase 6 | 音声翻訳 | ✅ 完了 | 2026-05-11 |
| 7 | Phase 7 | スキャン翻訳 | ✅ 完了 | 2026-05-11 |
| 8 | Phase 8 | メールのネパール語化 | ✅ 完了 | 2026-05-11 |

---

## 詳細作業ログ

---

### ✅ Phase 1: ピザサポート画面
**コミット:** `feat(pizza): ピザサポート画面を追加`

**作成ファイル:**
- `app/(tabs)/pizza.tsx` — ピザ情報画面（チェーン店 / デリバリー / アルバイトのフィルター付き）
- `src/lib/pizza.ts` — ピザ店データ定義（Pizza Hut, ドミノ, Uber Eats, 出前館, アルバイト情報）

**更新ファイル:**
- `app/(tabs)/_layout.tsx` — タブナビゲーションに追加
- `app/(tabs)/index.tsx` — ホーム画面にカード追加
- `src/locales/ja/translation.json` — 日本語翻訳追加
- `src/locales/ne/translation.json` — ネパール語翻訳追加
- `src/locales/en/translation.json` — 英語翻訳追加

---

### ✅ Phase 2: 求人・不動産サイト情報充実
**コミット:** `feat: Phase2+3 求人/不動産追加 & ネパール語アンケート実装`

**追加したサービス:**

| サービス | 種別 |
|---------|------|
| ハローワーク（公共職業安定所） | 求人・公的機関 |
| Indeed Japan | 求人・民間 |
| レオパレス21 | 不動産・仲介 |
| SUUMO（スーモ） | 不動産・ポータル |

**更新ファイル:**
- `src/lib/job.ts` — ハローワーク・Indeed Japan 追加
- `src/lib/realestate.ts` — レオパレス21・SUUMO 追加
- `src/locales/{ja,ne,en}/translation.json` — 3言語ロケール更新

---

### ✅ Phase 3: ネパール語アンケート（18問）
**コミット:** `feat: Phase2+3 求人/不動産追加 & ネパール語アンケート実装`

**作成ファイル:**
- `app/(tabs)/survey.tsx` — 18問バイリンガルアンケート画面
- `src/lib/survey.ts` — データ型・選択肢・Supabase送信関数

**アンケート構成:**

| # | 質問 | 形式 |
|---|------|------|
| Q1 | 日本在住期間 | 単一選択（5択） |
| Q2 | 日本語レベル | 単一選択（5択） |
| Q3 | アプリの使いやすさ | 星評価（1〜5） |
| Q4 | デザイン・色 | 星評価（1〜5） |
| Q5 | 動作速度 | 星評価（1〜5） |
| Q6 | 役立った機能 | 複数選択（8項目） |
| Q7 | 翻訳精度 | 星評価（1〜5） |
| Q8 | 追加してほしい機能 | 複数選択（5項目） |
| Q9 | 全体的な満足度 | 星評価（1〜5） |
| Q10 | 友人への推薦 | 単一選択（3択） |
| Q11 | 有料サブスク意向 | 単一選択（3択） |
| Q12 | 良かった点 | テキスト自由記述 |
| Q13 | 改善してほしい点 | テキスト自由記述 |
| Q14 | その他意見・要望 | テキスト自由記述 |
| Q15 | 仕事探しで使ったサービス | テキスト自由記述 |
| Q16 | 家探しで使ったサービス | テキスト自由記述 |
| Q17 | 学校探しで使ったサービス | テキスト自由記述 |
| Q18 | 困ったときの相談先 | テキスト自由記述 |

**Supabase テーブル（要作成）:**
```sql
CREATE TABLE survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  q1_residence text,
  q2_japanese_level text,
  q3_usability int,
  q4_design int,
  q5_speed int,
  q6_useful_features text[],
  q7_translation_accuracy int,
  q8_wanted_features text[],
  q9_satisfaction int,
  q10_recommend text,
  q11_paid_sub text,
  q12_good_points text,
  q13_improvements text,
  q14_other text,
  q15_job_service text,
  q16_housing_service text,
  q17_school_service text,
  q18_consultation text
);
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert" ON survey_responses FOR INSERT WITH CHECK (true);
```
→ **ユーザー確認済み：テーブル作成完了**

---

### ✅ Phase 4: AIチャットボット
**コミット:** `feat: Phase4-7 チャットボット/語学学習/音声翻訳/スキャン翻訳 実装`

**作成ファイル:**
- `app/chatbot.tsx` — チャット画面（Stack screen、タブバーなし）
- `src/lib/chatbot.ts` — OpenAI gpt-4o-mini チャット関数

**仕様:**
- システムプロンプト：在日ネパール人向けアシスタント「ネパルくん」
- ネパール語入力→ネパール語返答、日本語入力→日本語返答
- 起動時にウェルカムメッセージを表示
- チャット履歴はコンポーネント state で管理（セッション中のみ保持）
- ホーム画面のカードからアクセス（`/chatbot`）

---

### ✅ Phase 5: 語学学習（フラッシュカード）
**コミット:** `feat: Phase4-7 チャットボット/語学学習/音声翻訳/スキャン翻訳 実装`

**作成ファイル:**
- `app/study.tsx` — フラッシュカード画面（Stack screen）
- `src/lib/study.ts` — 語彙データ（6カテゴリ × 10枚 = 60枚）

**カテゴリ一覧:**

| カテゴリ | 内容 |
|---------|------|
| 👋 挨拶（अभिवादन） | おはようございます、ありがとう 等 |
| 🔢 数字（संख्या） | 一〜十 |
| 🏙️ 日常（दैनिक） | 電車、病院、銀行、コンビニ 等 |
| 💼 仕事（काम） | アルバイト、給料、面接、履歴書 等 |
| 🍱 食べ物（खाना） | ご飯、卵、野菜、魚 等 |
| 🆘 緊急（आपतकाल） | 助けて、救急車、警察 等 |

---

### ✅ Phase 6: 音声翻訳
**コミット:** `feat: Phase4-7 チャットボット/語学学習/音声翻訳/スキャン翻訳 実装`

**作成ファイル:**
- `src/lib/voiceTranslation.ts` — expo-av 録音 + OpenAI Whisper API 文字起こし

**更新ファイル:**
- `app/(tabs)/translation.tsx` — 🎤 音声入力ボタン追加

**フロー:**
1. 🎤 ボタン押下 → マイク権限確認 → 録音開始
2. ⏹ ボタン押下 → 録音停止 → Whisper API へ送信
3. 文字起こし結果をテキスト入力欄にセット
4. 「翻訳する」ボタンで通常翻訳に進む

---

### ✅ Phase 7: スキャン翻訳
**コミット:** `feat: Phase4-7 チャットボット/語学学習/音声翻訳/スキャン翻訳 実装`

**作成ファイル:**
- `src/lib/scanTranslation.ts` — expo-image-picker + GPT-4o-mini Vision OCR

**更新ファイル:**
- `app/(tabs)/translation.tsx` — 📷 スキャンボタン追加
- `app.json` — expo-av / expo-image-picker プラグイン追加
- `package.json` — expo-av / expo-image-picker 依存追加

**フロー:**
1. 📷 ボタン押下 → 「カメラ」または「ライブラリ」を選択
2. 画像取得 → base64変換 → GPT-4o-mini Vision API へ送信
3. テキスト抽出結果を入力欄にセット
4. 「翻訳する」ボタンで通常翻訳に進む

---

### ✅ Phase 8: メールのネパール語化
**作業内容:** Supabaseダッシュボードの設定変更（コード変更なし）

**設定場所:** Supabase → Authentication → Email Templates

**登録確認メール（Confirm signup）:**
```
Subject: 登録確認 / दर्ता पुष्टि गर्नुहोस्

नेपाल जीवन सहयोग एपमा स्वागत छ！
तलको लिङ्कमा क्लिक गरेर दर्ता पूरा गर्नुहोस्।

{{ .ConfirmationURL }}

यो लिङ्क २४ घण्टामा समाप्त हुनेछ।
```

**パスワードリセット（Reset password）:**
```
Subject: पासवर्ड रिसेट / パスワードリセット

तलको लिङ्कमा क्लिक गरेर नयाँ पासवर्ड बनाउनुहोस्।

{{ .ConfirmationURL }}
```

---

## インフラ・環境

### Vercel 環境変数（要設定）
| 変数名 | 説明 |
|--------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI APIキー |

### Supabaseテーブル一覧
| テーブル名 | 用途 | 作成状況 |
|-----------|------|---------|
| `auth.users` | ユーザー認証 | ✅ Supabase標準 |
| `survey_responses` | アンケート回答保存 | ✅ 作成済み |
| その他 | コミュニティ投稿等 | 要確認 |

### 機能別Web（Vercel）対応状況
| 機能 | Web対応 |
|------|---------|
| ピザ情報・求人・不動産・学校 | ✅ 完全対応 |
| アンケート | ✅ 完全対応 |
| 翻訳（テキスト） | ✅ 完全対応 |
| AIチャットボット | ✅ 完全対応 |
| 語学学習（フラッシュカード） | ✅ 完全対応 |
| スキャン翻訳（ライブラリ） | ✅ 対応 |
| スキャン翻訳（カメラ） | ⚠️ HTTPS必須（Vercelは対応済み） |
| 音声翻訳 | ⚠️ ブラウザによって制限あり |

---

## ブランチ・コミット履歴

| コミットハッシュ | 内容 |
|----------------|------|
| `b0c6505` | Initial commit |
| `1d028ac` | feat(job): 求人相談窓口画面を実装 |
| `6964d39` | chore: add vercel config for web deployment |
| `49049e7` | feat: ローカルの最新変更を反映 |
| `7d06852` | feat(pizza): ピザサポート画面を追加 |
| `a1769b4` | feat: Phase2+3 求人/不動産追加 & ネパール語アンケート実装 |
| `3df802f` | feat: Phase4-7 チャットボット/語学学習/音声翻訳/スキャン翻訳 実装 |
