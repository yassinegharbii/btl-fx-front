import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'
import { queryClient }  from '@/lib/queryClient'
import type { WsInEvent, WsOutEvent } from '@/types/chat.types'

export function useWebSocket(threadId: number | null) {
  const ws    = useRef<WebSocket | null>(null)
  const token = useAuthStore((s) => s.token)
  const store = useChatStore()

  const typingTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const sendQueue = useRef<WsOutEvent[]>([])

  // Garde le threadId courant pour filtrer les messages reçus
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

    // Reset complet du store à chaque changement de thread
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
      const event: WsInEvent = JSON.parse(ev.data)
      const currentUserId = useAuthStore.getState().user?.user_id

      // Filtre de sécurité : ignorer tout event qui ne concerne pas le thread actif
      const eventThreadId = (event as any).message?.thread_id
          ?? (event as any).data?.thread_id
          ?? null

      if (eventThreadId !== null && eventThreadId !== activeThreadId.current) {
        return
      }

      switch (event.type) {
        case 'history': {
          const hasMessages = event.messages.length > 0
          const historyThreadId = hasMessages ? event.messages[0].thread_id : threadId
          if (historyThreadId !== activeThreadId.current) return

          store.setMessages(event.messages)

          const isVisible = document.visibilityState === 'visible'

          event.messages.forEach((m) => {
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
          if (event.message.thread_id !== activeThreadId.current) break

          const existing = useChatStore.getState().messages
          const alreadyExists = existing.some(
              (m) => m.message_id === event.message.message_id
          )
          if (alreadyExists) break

          store.addMessage(event.message)

          if (event.message.sender_user_id !== currentUserId) {
            socket.send(JSON.stringify({
              type: 'message_delivered',
              data: { message_id: event.message.message_id },
            }))

            if (document.visibilityState === 'visible') {
              socket.send(JSON.stringify({
                type: 'message_read',
                data: { message_id: event.message.message_id },
              }))
            }
          }

          queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
          queryClient.invalidateQueries({ queryKey: ['threads'] })
          break
        }

        case 'typing': {
          if (event.data.user_id === currentUserId) break

          store.setTyping(event.data.user_id, event.data.is_typing)

          if (typingTimers.current[event.data.user_id]) {
            clearTimeout(typingTimers.current[event.data.user_id])
            delete typingTimers.current[event.data.user_id]
          }

          if (event.data.is_typing) {
            typingTimers.current[event.data.user_id] = setTimeout(() => {
              useChatStore.getState().setTyping(event.data.user_id, false)
              delete typingTimers.current[event.data.user_id]
            }, 4000)
          }
          break
        }

        case 'presence':
          store.setPresence(event.data.user_id, event.data.status)
          break

        case 'message_status_updated':
          store.updateStatus(event.data.message_id, event.data.status)
          if (event.data.status === 'READ') {
            queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
            queryClient.invalidateQueries({ queryKey: ['threads'] })
          }
          break

        case 'messages_read':
          store.markAllRead(event.data.message_ids)
          queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
          queryClient.invalidateQueries({ queryKey: ['threads'] })
          break

        case 'ticket_created':
        case 'ticket_accepted':
        case 'ticket_declined':
        case 'ticket_expired':
          queryClient.invalidateQueries({ queryKey: ['tickets', threadId] })
          queryClient.invalidateQueries({ queryKey: ['tickets'] })
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

      // Marquer le thread comme inactif AVANT de fermer le WS
      activeThreadId.current = null

      if (socket.readyState === WebSocket.OPEN) socket.close()
      ws.current = null
    }
  }, [threadId, token])

  return { send }
}