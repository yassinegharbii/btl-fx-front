import { api } from '@/lib/axios'
import type { Thread, Message } from '@/types/chat.types'

export const chatApi = {
  getMyThread: () =>
    api.get<Thread>('/chat/my-thread').then((r) => r.data),

  getAllThreads: (limit = 50, offset = 0) =>
    api.get<Thread[]>('/chat/threads', { params: { limit, offset } }).then((r) => r.data),

  getMessages: (threadId: number) =>
    api.get<Message[]>(`/chat/threads/${threadId}/messages`).then((r) => r.data),

  getUnreadCount: (threadId: number) =>
    api.get<{ thread_id: number; unread_count: number }>(
      `/chat/threads/${threadId}/unread-count`
    ).then((r) => r.data),

  postMessage: (threadId: number, content: string) =>
    api.post<Message>(`/chat/threads/${threadId}/messages`, { content }).then((r) => r.data),

  getThread: (threadId: number) =>
    api.get<Thread>(`/chat/threads/${threadId}`).then((r) => r.data),
}