import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useWebSocket }     from '@/hooks/useWebSocket'
import { useChatStore }     from '@/stores/chat.store'
import { useUserById }      from '@/hooks/useUsers'
import { chatApi }          from '@/api/chat.api'
import { queryClient }      from '@/lib/queryClient'

import { TraderSidebar }       from '@/components/chat/TraderSidebar'
import { MessageBubble }       from '@/components/chat/MessageBubble'
import { ChatInput }           from '@/components/chat/ChatInput'
import { TypingIndicator }     from '@/components/chat/TypingIndicator'
import { PresenceDot }         from '@/components/chat/PresenceDot'
import { LastMessageStatus }   from '@/components/chat/LastMessageStatus'
import { ConversationStats }   from '@/components/chat/ConversationStats'
import { TicketForm }          from '@/components/ticket/TicketForm'
import { Avatar }              from '@/components/ui/Avatar'
import { Button }              from '@/components/ui/Button'
import { LogOut, PlusCircle }  from 'lucide-react'
import { useAuthStore }        from '@/stores/auth.store'

export default function TraderChatPage() {
  const { threadId: threadIdStr } = useParams()
  const threadId = threadIdStr ? Number(threadIdStr) : null

  const messages = useChatStore((s) => s.messages)
  const typing   = useChatStore((s) => s.typing)
  const presence = useChatStore((s) => s.presence)

  const logout = useAuthStore((s) => s.logout)

  const { send }  = useWebSocket(threadId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: thread } = useQuery({
    queryKey: ['thread', threadId],
    queryFn:  () =>
        chatApi.getAllThreads().then(
            (threads) => threads.find((t) => t.thread_id === threadId) ?? null
        ),
    enabled: !!threadId,
    refetchInterval: 10_000,
  })

  const clientId = thread?.client_id ?? null
  const { data: client } = useUserById(clientId)

  const displayName = client?.full_name ?? client?.username ?? (clientId ? `Client #${clientId}` : 'Client')
  const isClientTyping = clientId ? typing[clientId] : false

  const clientWsPresence = clientId ? presence[clientId] : undefined
  const isOnline = clientWsPresence
      ? clientWsPresence === 'online'
      : thread?.client_online ?? false

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (threadId) {
      send({ type: 'mark_all_read' })
      send({ type: 'last_seen' })
      queryClient.invalidateQueries({ queryKey: ['unread', threadId] })
    }
  }, [threadId])

  const handleSend = (content: string) => {
    send({ type: 'message', content })
  }

  const statusLabel = useMemo(() => {
    if (isClientTyping) return "en train d'écrire..."
    return isOnline ? 'En ligne' : 'Hors ligne'
  }, [isClientTyping, isOnline])

  return (
      <div className="flex h-screen overflow-hidden" style={{ background: '#070d09' }}>

        <aside className="w-72 flex-shrink-0">
          <TraderSidebar />
        </aside>

        <div className="flex-1 flex flex-col min-w-0">

          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0"
               style={{
                 background: 'rgba(15, 58, 26, 0.8)',
                 borderColor: 'rgba(42, 128, 64, 0.3)',
               }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={displayName} size="md" color="green" />
                {clientId && (
                    <PresenceDot
                        userId={clientId}
                        fallbackOnline={thread?.client_online ?? false}
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3"
                        style={{ border: '2px solid #0f3a1a' }}
                    />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{displayName}</div>
                <div className="text-[11px]" style={{ color: '#a8c4aa' }}>
                  {statusLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5"
              >
                <PlusCircle size={14} />
                Nouveau ticket
              </Button>

              <div className="w-px h-6" style={{ background: 'rgba(42, 128, 64, 0.3)' }} />

              <button
                  onClick={logout}
                  title="Déconnexion"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(15, 58, 26, 0.4)',
                    border: '1px solid rgba(42, 128, 64, 0.3)',
                    color: '#a8c4aa',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(200, 16, 46, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(200, 16, 46, 0.4)'
                    e.currentTarget.style.color = '#fb7185'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 58, 26, 0.4)'
                    e.currentTarget.style.borderColor = 'rgba(42, 128, 64, 0.3)'
                    e.currentTarget.style.color = '#a8c4aa'
                  }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* ✅ STATS PANEL — placé entre header et messages */}
          {threadId && <ConversationStats threadId={threadId} />}

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 min-h-0">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-3xl mb-3">💬</div>
                  <p className="text-sm text-white/30">Début de la conversation</p>
                  <p className="text-xs text-white/15 mt-1">
                    Envoyez un message ou proposez un ticket de change
                  </p>
                </div>
            )}

            {messages.map((msg) => (
                <MessageBubble key={msg.message_id} message={msg} />
            ))}

            <div ref={bottomRef} />
          </div>

          {isClientTyping && <TypingIndicator />}
          <LastMessageStatus />

          {/* ✅ key={threadId} — force le remount du ChatInput à chaque changement
                 de conversation → l'input local est réinitialisé automatiquement */}
          <ChatInput key={threadId ?? 'no-thread'} onSend={handleSend} onEvent={send} />
        </div>

        {showForm && threadId && (
            <TicketForm threadId={threadId} onClose={() => setShowForm(false)} />
        )}
      </div>
  )
}