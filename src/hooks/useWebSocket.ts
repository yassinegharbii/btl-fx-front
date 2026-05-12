import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'
import { queryClient }  from '@/lib/queryClient'
import type { WsOutEvent } from '@/types/chat.types'

const GLOBAL_EVENT_TYPES = new Set<string>([
  'trader_rates_updated',
])

interface RawWsEvent {
  type: string
  message?:   { thread_id?: number; [k: string]: unknown }
  data?:      { thread_id?: number; [k: string]: unknown }
  messages?:  Array<{
    message_id:     number
    thread_id:      number
    sender_user_id: number
    status:         string
    [k: string]: unknown
  }>
  [k: string]: unknown
}

export function useWebSocket(threadId: number | null) {
  const ws    = useRef<WebSocket | null>(null)
  const token = useAuthStore((s) => s.token)
  const store = useChatStore()

  const typingTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const sendQueue = useRef<WsOutEvent[]>([])

  const activeThreadId = useRef<number | null>(null)

  const send = useCallback((event: WsOutEvent) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(event))
    } else {
      sendQueue.current.push(event)
    }
  }, [])

  useEffect(() => {
    if (!threadId || !token) return

    useChatStore.getState().resetMessages()
    activeThreadId.current = threadId

    Object.values(typingTimers.current).forEach(clearTimeout)
    typingTimers.current = {}

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const url = `${protocol}://${window.location.host}/ws/threads/${threadId}?token=${token}`
    const socket = new WebSocket(url)
    ws.current = socket

    socket.onopen = () => {
      const queue = [...sendQueue.current]
      sendQueue.current = []
      queue.forEach((evt) => socket.send(JSON.stringify(evt)))

      socket.send(JSON.stringify({ type: 'last_seen' }))
      socket.send(JSON.stringify({ type: 'mark_all_read' }))
    }

    socket.onmessage = (ev) => {
      const event: RawWsEvent = JSON.parse(ev.data)
      const currentUserId = useAuthStore.getState().user?.user_id

      const isGlobalEvent = GLOBAL_EVENT_TYPES.has(event.type)

      if (!isGlobalEvent) {
        const eventThreadId = event.message?.thread_id
            ?? event.data?.thread_id
            ?? null

        if (eventThreadId !== null && eventThreadId !== activeThreadId.current) {
          return
        }
      }

      switch (event.type) {
        case 'history': {
          const messages = event.messages ?? []
          const hasMessages = messages.length > 0
          const historyThreadId = hasMessages ? messages[0].thread_id : threadId
          if (historyThreadId !== activeThreadId.current) return

          store.setMessages(messages as never)

          const isVisible = document.visibilityState === 'visible'

          messages.forEach((m) => {
            if (m.sender_user_id === currentUserId) return

            if (m.status === 'SENT') {
              socket.send(JSON.stringify({
                type: 'message_delivered',
                data: { message_id: m.message_id },
              }))
            }

            if (isVisible && m.status !== 'READ') {
              socket.send(JSON.stringify({
                type: 'message_read',
                data: { message_id: m.message_id },
              }))
            }
          })

          if (isVisible) {
            socket.send(JSON.stringify({ type: 'mark_all_read' }))
          }
          break
        }

        case 'message': {
          const msg = event.message
          if (!msg || msg.thread_id !== activeThreadId.current) break

          const messageId = msg.message_id as number
          const senderUserId = msg.sender_user_id as number

          const existing = useChatStore.getState().messages
          const alreadyExists = existing.some((m) => m.message_id === messageId)
          if (alreadyExists) break

          store.addMessage(msg as never)

          if (senderUserId !== currentUserId) {
            socket.send(JSON.stringify({
              type: 'message_delivered',
              data: { message_id: messageId },
            }))

            if (document.visibilityState === 'visible') {
              socket.send(JSON.stringify({
                type: 'message_read',
                data: { message_id: messageId },
              }))
            }
          }

          queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
          queryClient.invalidateQueries({ queryKey: ['threads'] })
          break
        }

        case 'typing': {
          const data = event.data
          if (!data) break

          const userId   = data.user_id as number
          const isTyping = data.is_typing as boolean

          if (userId === currentUserId) break

          store.setTyping(userId, isTyping)

          if (typingTimers.current[userId]) {
            clearTimeout(typingTimers.current[userId])
            delete typingTimers.current[userId]
          }

          if (isTyping) {
            typingTimers.current[userId] = setTimeout(() => {
              useChatStore.getState().setTyping(userId, false)
              delete typingTimers.current[userId]
            }, 4000)
          }
          break
        }

        case 'presence': {
          const data = event.data
          if (!data) break
          store.setPresence(data.user_id as number, data.status as 'online' | 'offline')
          break
        }

        case 'message_status_updated': {
          const data = event.data
          if (!data) break
          const messageId = data.message_id as number
          const newStatus = data.status as string
          store.updateStatus(messageId, newStatus as never)
          if (newStatus === 'READ') {
            queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
            queryClient.invalidateQueries({ queryKey: ['threads'] })
          }
          break
        }

        case 'messages_read': {
          const data = event.data
          if (!data) break
          store.markAllRead(data.message_ids as number[])
          queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
          queryClient.invalidateQueries({ queryKey: ['threads'] })
          break
        }

          /* ─── Tous les events tickets : 1 seule invalidation ─── */
        case 'ticket_created':
        case 'ticket_accepted':
        case 'ticket_declined':
        case 'ticket_expired':
        case 'ticket_created_by_client':
        case 'ticket_accepted_by_trader':
        case 'ticket_declined_by_trader':
        case 'ticket_countered':
          queryClient.invalidateQueries({ queryKey: ['tickets', threadId] })
          break

        case 'trader_rates_updated':
          queryClient.invalidateQueries({ queryKey: ['trader-rates'] })
          break
      }
    }

    socket.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'mark_all_read' }))
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)

      Object.values(typingTimers.current).forEach(clearTimeout)
      typingTimers.current = {}

      activeThreadId.current = null

      if (socket.readyState === WebSocket.OPEN) socket.close()
      ws.current = null
    }
  }, [threadId, token])

  return { send }
}