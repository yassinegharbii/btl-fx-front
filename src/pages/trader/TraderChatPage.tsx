import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useWebSocket }     from '@/hooks/useWebSocket'
import { useChatStore }     from '@/stores/chat.store'
import { useUserById }      from '@/hooks/useUsers'
import { chatApi }          from '@/api/chat.api'
import { queryClient }      from '@/lib/queryClient'
import { useIsMobile }      from '@/hooks/useIsMobile'

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
import { MobileDrawer }        from '@/components/ui/MobileDrawer'
import { LogOut, PlusCircle, Menu, Plus, Home } from 'lucide-react'
import { useAuthStore }        from '@/stores/auth.store'

export default function TraderChatPage() {
  const { threadId: threadIdStr } = useParams()
  const threadId = threadIdStr ? Number(threadIdStr) : null
  const navigate = useNavigate()

  const messages = useChatStore((s) => s.messages)
  const typing   = useChatStore((s) => s.typing)
  const presence = useChatStore((s) => s.presence)

  const logout   = useAuthStore((s) => s.logout)
  const isMobile = useIsMobile()

  const { send }  = useWebSocket(threadId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [showForm,    setShowForm]    = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

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
      setShowSidebar(false)
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

        {/* ─── SIDEBAR ─── */}
        {!isMobile && (
            <aside className="w-72 flex-shrink-0">
              <TraderSidebar />
            </aside>
        )}

        {isMobile && (
            <MobileDrawer
                open={showSidebar}
                onClose={() => setShowSidebar(false)}
                side="left"
                title="Conversations"
                width="85vw"
            >
              <TraderSidebar />
            </MobileDrawer>
        )}

        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* HEADER */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b flex-shrink-0 gap-2"
               style={{
                 background: 'rgba(15, 58, 26, 0.8)',
                 borderColor: 'rgba(42, 128, 64, 0.3)',
               }}>

            {/* Hamburger sur mobile */}
            {isMobile && (
                <button
                    onClick={() => setShowSidebar(true)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                    style={{
                      background: 'rgba(74, 222, 128, 0.12)',
                      border: '1px solid rgba(74, 222, 128, 0.3)',
                      color: '#4ade80',
                    }}
                    aria-label="Ouvrir le menu"
                >
                  <Menu size={18} />
                </button>
            )}

            {/* ✅ NOUVEAU — Bouton Accueil */}
            <button
                onClick={() => navigate('/trader')}
                title="Retour au tableau de bord"
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                style={{
                  background: 'rgba(74, 222, 128, 0.08)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  color: '#4ade80',
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = 'rgba(74, 222, 128, 0.18)'
                    e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = 'rgba(74, 222, 128, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.25)'
                  }
                }}
                aria-label="Tableau de bord"
            >
              <Home size={16} />
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
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
              <div className="min-w-0 flex-1">
                <div className="text-[13px] sm:text-sm font-semibold text-white truncate">
                  {displayName}
                </div>
                <div className="text-[10px] sm:text-[11px] truncate" style={{ color: '#a8c4aa' }}>
                  {statusLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isMobile && (
                  <>
                    <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} />
                      Nouveau ticket
                    </Button>
                    <div className="w-px h-6" style={{ background: 'rgba(42, 128, 64, 0.3)' }} />
                  </>
              )}

              <button
                  onClick={logout}
                  title="Déconnexion"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{
                    background: 'rgba(15, 58, 26, 0.4)',
                    border: '1px solid rgba(42, 128, 64, 0.3)',
                    color: '#a8c4aa',
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.background = 'rgba(200, 16, 46, 0.15)'
                      e.currentTarget.style.borderColor = 'rgba(200, 16, 46, 0.4)'
                      e.currentTarget.style.color = '#fb7185'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.background = 'rgba(15, 58, 26, 0.4)'
                      e.currentTarget.style.borderColor = 'rgba(42, 128, 64, 0.3)'
                      e.currentTarget.style.color = '#a8c4aa'
                    }
                  }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* STATS PANEL */}
          {threadId && <ConversationStats threadId={threadId} />}

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1.5 min-h-0">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
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

          <ChatInput key={threadId ?? 'no-thread'} onSend={handleSend} onEvent={send} />

          {/* FAB mobile uniquement */}
          {isMobile && threadId && (
              <button
                  onClick={() => setShowForm(true)}
                  className="absolute z-30 rounded-full flex items-center justify-center transition-all active:scale-95"
                  style={{
                    bottom: 'calc(80px + env(safe-area-inset-bottom, 0))',
                    right: 16,
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #4ade80, #2a8040)',
                    border: '2px solid rgba(74, 222, 128, 0.5)',
                    color: '#fff',
                    boxShadow: '0 8px 24px rgba(26, 92, 42, 0.6), 0 0 0 4px rgba(74, 222, 128, 0.15)',
                  }}
                  aria-label="Nouveau ticket"
                  title="Créer un ticket"
              >
                <Plus size={26} strokeWidth={2.5} />
              </button>
          )}
        </div>

        {showForm && threadId && (
            <TicketForm threadId={threadId} onClose={() => setShowForm(false)} />
        )}
      </div>
  )
}