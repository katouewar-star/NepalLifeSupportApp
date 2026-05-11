import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { sendMessage, ChatMessage } from '@/lib/chatbot'

const RED = '#E63946'

const WELCOME: ChatMessage = {
  id: '0',
  role: 'assistant',
  content:
    'こんにちは！在日ネパール人サポートAIです。\nनमस्ते! म तपाईंलाई जापानमा बस्न मद्दत गर्छु।\n\nどんなことでもお気軽にご相談ください！',
}

export default function ChatbotScreen() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text }
    const history = messages.filter((m) => m.id !== '0')
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendMessage(history, text)
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'エラーが発生しました。もう一度お試しください。\nत्रुटि भयो। फेरि प्रयास गर्नुहोस्।',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>AIアシスタント</Text>
          <Text style={s.headerSub}>AI सहायक</Text>
        </View>
        <View style={s.backBtn} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messageList}
        contentContainerStyle={s.messageContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleAssistant]}
          >
            {msg.role === 'assistant' && (
              <Text style={s.botIcon}>🤖</Text>
            )}
            <View style={[s.bubbleInner, msg.role === 'user' ? s.bubbleUserInner : s.bubbleAssistantInner]}>
              <Text style={[s.bubbleText, msg.role === 'user' ? s.bubbleUserText : s.bubbleAssistantText]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[s.bubble, s.bubbleAssistant]}>
            <Text style={s.botIcon}>🤖</Text>
            <View style={s.bubbleAssistantInner}>
              <ActivityIndicator size="small" color={RED} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="日本語またはネパール語で入力... / नेपाली वा जापानीमा लेख्नुहोस्"
          placeholderTextColor="#bbb"
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
        >
          <Text style={s.sendIcon}>▶</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: RED,
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 36, alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },

  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 12, paddingBottom: 8 },

  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleAssistant: { justifyContent: 'flex-start' },

  botIcon: { fontSize: 22, marginBottom: 4 },

  bubbleInner: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  bubbleUserInner: {
    backgroundColor: RED,
    borderBottomRightRadius: 4,
  },
  bubbleAssistantInner: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleUserText: { color: '#fff' },
  bubbleAssistantText: { color: '#1a1a2e' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    backgroundColor: '#fafafa',
  },
  sendBtn: {
    backgroundColor: RED,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#ddd' },
  sendIcon: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
