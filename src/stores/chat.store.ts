import { create } from 'zustand'
import type { Message, Thread } from '@/types/chat.types'

interface PresenceMap { [userId: number]: 'online' | 'offline' }
interface TypingMap   { [userId: number]: boolean }

interface ChatState {
  threads:       Thread[]
  messages:      Message[]
  presence:      PresenceMap
  typing:        TypingMap
  unreadCount:   number

  setThreads:     (t: Thread[]) => void
  setMessages:    (m: Message[]) => void
  addMessage:     (m: Message) => void
  updateStatus:   (messageId: number, status: Message['status']) => void
  markAllRead:    (ids: number[]) => void
  setPresence:    (userId: number, status: 'online' | 'offline') => void
  setTyping:      (userId: number, isTyping: boolean) => void
  setUnread:      (n: number) => void
  resetMessages:  () => void   // ← NOUVEAU : reset uniquement les messages (changement de thread)
  reset:          () => void   // reset complet (logout)
}

export const useChatStore = create<ChatState>((set) => ({
  threads:     [],
  messages:    [],
  presence:    {},
  typing:      {},
  unreadCount: 0,

  setThreads:  (threads)  => set({ threads }),
  setMessages: (messages) => set({ messages }),

  addMessage: (msg) =>
      set((s) => ({
        messages: [...s.messages, msg],
      })),

  updateStatus: (messageId, status) =>
      set((s) => ({
        messages: s.messages.map((m) =>
            m.message_id === messageId ? { ...m, status } : m
        ),
      })),

  markAllRead: (ids) =>
      set((s) => ({
        messages: s.messages.map((m) =>
            ids.includes(m.message_id) ? { ...m, status: 'READ' } : m
        ),
      })),

  setPresence: (userId, status) =>
      set((s) => ({ presence: { ...s.presence, [userId]: status } })),

  setTyping: (userId, isTyping) =>
      set((s) => ({ typing: { ...s.typing, [userId]: isTyping } })),

  setUnread: (n) => set({ unreadCount: n }),

  // ✅ Reset uniquement les messages + typing (changement de thread)
  // Garde les threads et la presence intacts
  resetMessages: () => set({ messages: [], typing: {} }),

  // Reset complet (logout)
  reset: () => set({
    threads: [],
    messages: [],
    presence: {},
    typing: {},
    unreadCount: 0,
  }),
}))