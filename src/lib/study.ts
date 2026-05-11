export interface VocabCard {
  id: string
  japanese: string
  reading?: string
  nepali: string
}

export interface VocabCategory {
  id: string
  label: { ja: string; ne: string }
  icon: string
  cards: VocabCard[]
}

export const VOCAB_CATEGORIES: VocabCategory[] = [
  {
    id: 'greeting',
    label: { ja: '挨拶', ne: 'अभिवादन' },
    icon: '👋',
    cards: [
      { id: 'g1', japanese: 'おはようございます', reading: 'ohayou gozaimasu', nepali: 'शुभप्रभात' },
      { id: 'g2', japanese: 'こんにちは', reading: 'konnichiwa', nepali: 'नमस्ते' },
      { id: 'g3', japanese: 'こんばんは', reading: 'konbanwa', nepali: 'शुभसन्ध्या' },
      { id: 'g4', japanese: 'ありがとうございます', reading: 'arigatou gozaimasu', nepali: 'धन्यवाद' },
      { id: 'g5', japanese: 'すみません', reading: 'sumimasen', nepali: 'माफ गर्नुहोस्' },
      { id: 'g6', japanese: 'はい', reading: 'hai', nepali: 'हो' },
      { id: 'g7', japanese: 'いいえ', reading: 'iie', nepali: 'होइन' },
      { id: 'g8', japanese: 'わかりました', reading: 'wakarimashita', nepali: 'बुझें' },
      { id: 'g9', japanese: 'もう一度言ってください', reading: 'mou ichido itte kudasai', nepali: 'फेरि भन्नुहोस्' },
      { id: 'g10', japanese: 'よろしくお願いします', reading: 'yoroshiku onegaishimasu', nepali: 'कृपया सहयोग गर्नुहोस्' },
    ],
  },
  {
    id: 'number',
    label: { ja: '数字', ne: 'संख्या' },
    icon: '🔢',
    cards: [
      { id: 'n1', japanese: '一（いち）', reading: 'ichi', nepali: 'एक' },
      { id: 'n2', japanese: '二（に）', reading: 'ni', nepali: 'दुई' },
      { id: 'n3', japanese: '三（さん）', reading: 'san', nepali: 'तीन' },
      { id: 'n4', japanese: '四（し・よん）', reading: 'shi / yon', nepali: 'चार' },
      { id: 'n5', japanese: '五（ご）', reading: 'go', nepali: 'पाँच' },
      { id: 'n6', japanese: '六（ろく）', reading: 'roku', nepali: 'छ' },
      { id: 'n7', japanese: '七（しち・なな）', reading: 'shichi / nana', nepali: 'सात' },
      { id: 'n8', japanese: '八（はち）', reading: 'hachi', nepali: 'आठ' },
      { id: 'n9', japanese: '九（く・きゅう）', reading: 'ku / kyuu', nepali: 'नौ' },
      { id: 'n10', japanese: '十（じゅう）', reading: 'juu', nepali: 'दस' },
    ],
  },
  {
    id: 'daily',
    label: { ja: '日常', ne: 'दैनिक' },
    icon: '🏙️',
    cards: [
      { id: 'd1', japanese: '電車', reading: 'densha', nepali: 'रेल' },
      { id: 'd2', japanese: 'バス', reading: 'basu', nepali: 'बस' },
      { id: 'd3', japanese: '病院', reading: 'byouin', nepali: 'अस्पताल' },
      { id: 'd4', japanese: '薬局', reading: 'yakkyoku', nepali: 'औषधि पसल' },
      { id: 'd5', japanese: 'スーパー', reading: 'suupaa', nepali: 'सुपरमार्केट' },
      { id: 'd6', japanese: '駅', reading: 'eki', nepali: 'रेल स्टेशन' },
      { id: 'd7', japanese: '銀行', reading: 'ginkou', nepali: 'बैंक' },
      { id: 'd8', japanese: '郵便局', reading: 'yuubinkyoku', nepali: 'हुलाक घर' },
      { id: 'd9', japanese: 'コンビニ', reading: 'konbini', nepali: 'कन्भिनियन्स स्टोर' },
      { id: 'd10', japanese: '警察', reading: 'keisatsu', nepali: 'प्रहरी' },
    ],
  },
  {
    id: 'work',
    label: { ja: '仕事', ne: 'काम' },
    icon: '💼',
    cards: [
      { id: 'w1', japanese: 'アルバイト', reading: 'arubaito', nepali: 'पार्ट टाइम काम' },
      { id: 'w2', japanese: '正社員', reading: 'seishain', nepali: 'स्थायी कर्मचारी' },
      { id: 'w3', japanese: '給料', reading: 'kyuuryou', nepali: 'तलब' },
      { id: 'w4', japanese: '休み', reading: 'yasumi', nepali: 'बिदा' },
      { id: 'w5', japanese: '残業', reading: 'zangyou', nepali: 'ओभरटाइम' },
      { id: 'w6', japanese: '面接', reading: 'mensetsu', nepali: 'अन्तर्वार्ता' },
      { id: 'w7', japanese: '履歴書', reading: 'rirekisho', nepali: 'बायोडाटा' },
      { id: 'w8', japanese: '上司', reading: 'joushi', nepali: 'बस/वरिष्ठ' },
      { id: 'w9', japanese: '同僚', reading: 'douryou', nepali: 'सहकर्मी' },
      { id: 'w10', japanese: '退職', reading: 'taishoku', nepali: 'राजीनामा' },
    ],
  },
  {
    id: 'food',
    label: { ja: '食べ物', ne: 'खाना' },
    icon: '🍱',
    cards: [
      { id: 'f1', japanese: 'ご飯', reading: 'gohan', nepali: 'भात' },
      { id: 'f2', japanese: 'パン', reading: 'pan', nepali: 'रोटी/पाउरोटी' },
      { id: 'f3', japanese: '水', reading: 'mizu', nepali: 'पानी' },
      { id: 'f4', japanese: '牛乳', reading: 'gyuunyuu', nepali: 'गाईको दूध' },
      { id: 'f5', japanese: '卵', reading: 'tamago', nepali: 'अण्डा' },
      { id: 'f6', japanese: '肉', reading: 'niku', nepali: 'मासु' },
      { id: 'f7', japanese: '野菜', reading: 'yasai', nepali: 'तरकारी' },
      { id: 'f8', japanese: '魚', reading: 'sakana', nepali: 'माछा' },
      { id: 'f9', japanese: '果物', reading: 'kudamono', nepali: 'फलफूल' },
      { id: 'f10', japanese: 'お菓子', reading: 'okashi', nepali: 'मिठाई/बिस्कुट' },
    ],
  },
  {
    id: 'emergency',
    label: { ja: '緊急', ne: 'आपतकाल' },
    icon: '🆘',
    cards: [
      { id: 'e1', japanese: '助けてください', reading: 'tasukete kudasai', nepali: 'मलाई बचाउनुहोस्' },
      { id: 'e2', japanese: '救急車を呼んでください', reading: 'kyuukyuusha wo yonde kudasai', nepali: 'एम्बुलेन्स बोलाउनुहोस्' },
      { id: 'e3', japanese: '火事', reading: 'kaji', nepali: 'आगलागी' },
      { id: 'e4', japanese: '痛いです', reading: 'itai desu', nepali: 'दुखाइ छ' },
      { id: 'e5', japanese: '病気です', reading: 'byouki desu', nepali: 'म बिरामी छु' },
      { id: 'e6', japanese: '迷子になりました', reading: 'maigo ni narimashita', nepali: 'म हराएँ' },
      { id: 'e7', japanese: '電話してください', reading: 'denwa shite kudasai', nepali: 'फोन गर्नुहोस्' },
      { id: 'e8', japanese: '病院へ行きたい', reading: 'byouin e ikitai', nepali: 'अस्पताल जान चाहन्छु' },
      { id: 'e9', japanese: 'どこですか？', reading: 'doko desu ka?', nepali: 'यो कहाँ छ?' },
      { id: 'e10', japanese: '財布を盗まれました', reading: 'saifu wo nusumaremashita', nepali: 'मेरो पर्स चोरियो' },
    ],
  },
]
