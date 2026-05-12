import { useEffect, useRef, useState } from 'react'
import { LogOut, TrendingUp, Plus } from 'lucide-react'

import { useMyThread }      from '@/hooks/useThread'
import { useWebSocket }     from '@/hooks/useWebSocket'
import { useThreadTickets } from '@/hooks/useTickets'
import { useChatStore }     from '@/stores/chat.store'
import { useAuthStore }     from '@/stores/auth.store'
import { useIsMobile }      from '@/hooks/useIsMobile'

import { MessageBubble }     from '@/components/chat/MessageBubble'
import { ChatInput }         from '@/components/chat/ChatInput'
import { TypingIndicator }   from '@/components/chat/TypingIndicator'
import { PresenceDot }       from '@/components/chat/PresenceDot'
import { LastMessageStatus } from '@/components/chat/LastMessageStatus'
import { RateSidebar }       from '@/components/rates/RateSidebar'
import { TicketPopup }       from '@/components/ticket/TicketPopup'
import { ClientTicketForm }  from '@/components/ticket/ClientTicketForm'  // ✅ NEW
import { Spinner }           from '@/components/ui/Spinner'
import { MobileDrawer }      from '@/components/ui/MobileDrawer'
import { ThemeToggle }       from '@/components/ui/ThemeToggle'
import { queryClient }       from '@/lib/queryClient'

export default function ClientChatPage() {
    const { data: thread, isLoading } = useMyThread()
    const logout   = useAuthStore((s) => s.logout)
    const messages = useChatStore((s) => s.messages)
    const typing   = useChatStore((s) => s.typing)
    const presence = useChatStore((s) => s.presence)

    const isMobile = useIsMobile()
    const [showRatesDrawer, setShowRatesDrawer] = useState(false)
    const [showTicketForm, setShowTicketForm]   = useState(false)  // ✅ NEW

    const threadId = thread?.thread_id ?? null
    const { send } = useWebSocket(threadId)
    const bottomRef = useRef<HTMLDivElement>(null)

    const { data: tickets } = useThreadTickets(threadId)

    /* ─── ✅ Le client voit une popup pour 2 statuts ─── */
    const pendingTicket = tickets?.find((t) =>
        t.order_status === 'PROPOSED' ||
        t.order_status === 'COUNTERED_BY_TRADER'
    )

    /* ─── ✅ Si un ticket est PROPOSED_BY_CLIENT, on n'affiche PAS le FAB
           (le client attend la réponse du trader) ─── */
    const hasPendingClientTicket = tickets?.some((t) =>
        t.order_status === 'PROPOSED_BY_CLIENT'
    )

    useEffect(() => {
        if (!pendingTicket?.valid_until) return
        const end = new Date(pendingTicket.valid_until).getTime()
        const remaining = end - Date.now()
        if (remaining <= 0) {
            queryClient.invalidateQueries({ queryKey: ['tickets', threadId] })
            return
        }
        const timer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['tickets', threadId] })
        }, remaining + 500)
        return () => clearTimeout(timer)
    }, [pendingTicket?.order_id, pendingTicket?.valid_until, threadId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (threadId) {
            send({ type: 'mark_all_read' })
            send({ type: 'last_seen' })
        }
    }, [threadId, send])

    const handleSend = (content: string) => {
        send({ type: 'message', content })
    }

    const traderId = thread?.trader_id ?? null
    const isTraderTyping = traderId ? typing[traderId] : false
    const traderWsPresence = traderId ? presence[traderId] : undefined
    const isTraderOnline = traderWsPresence
        ? traderWsPresence === 'online'
        : thread?.trader_online ?? false

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center"
                 style={{ background: 'var(--color-bg-primary)' }}>
                <Spinner />
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden"
             style={{ background: 'var(--color-bg-primary)' }}>

            {!isMobile && (
                <aside className="w-60 flex-shrink-0">
                    <RateSidebar />
                </aside>
            )}

            {isMobile && (
                <MobileDrawer
                    open={showRatesDrawer}
                    onClose={() => setShowRatesDrawer(false)}
                    side="left"
                    title="Cours de change"
                    width="85vw"
                >
                    <div className="h-full">
                        <RateSidebar />
                    </div>
                </MobileDrawer>
            )}

            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* HEADER */}
                <div
                    className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b flex-shrink-0 gap-2"
                    style={{
                        background: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {isMobile && (
                        <button
                            onClick={() => setShowRatesDrawer(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                            style={{
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-border)',
                                color: 'var(--color-success)',
                            }}
                            aria-label="Voir les taux"
                        >
                            <TrendingUp size={18} />
                        </button>
                    )}

                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-border)',
                            }}
                        >
                            <span className="text-[10px] sm:text-xs font-bold"
                                  style={{ color: 'var(--color-success)' }}>
                                BTL
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13px] sm:text-sm font-semibold truncate"
                                      style={{ color: 'var(--color-text-primary)' }}>
                                    {isMobile ? 'Salle des marchés' : 'Salle des marchés BTL'}
                                </span>
                                {traderId && (
                                    <PresenceDot
                                        userId={traderId}
                                        fallbackOnline={thread?.trader_online ?? false}
                                    />
                                )}
                            </div>
                            <span className="text-[10px] sm:text-[11px] truncate block"
                                  style={{ color: 'var(--color-text-secondary)' }}>
                                {traderId
                                    ? isTraderTyping
                                        ? "en train d'écrire..."
                                        : isTraderOnline ? 'Trader disponible' : 'Trader hors ligne'
                                    : "En attente d'un trader"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ThemeToggle />

                        <button
                            onClick={logout}
                            title="Déconnexion"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                            style={{
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1.5 min-h-0">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="text-4xl mb-3">💱</div>
                            <p className="text-sm font-medium"
                               style={{ color: 'var(--color-text-secondary)' }}>
                                Bienvenue sur BTL-FX
                            </p>
                            <p className="text-xs mt-1 max-w-xs"
                               style={{ color: 'var(--color-text-tertiary)' }}>
                                Envoyez un message à votre trader ou proposez directement un taux
                            </p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <MessageBubble key={msg.message_id} message={msg} />
                    ))}

                    <div ref={bottomRef} />
                </div>

                {isTraderTyping && <TypingIndicator />}
                <LastMessageStatus />
                <ChatInput key={threadId ?? 'no-thread'} onSend={handleSend} onEvent={send} />

                {/* ─── ✅ FAB "Proposer un taux" côté client ─── */}
                {threadId && !hasPendingClientTicket && !pendingTicket && (
                    <button
                        onClick={() => setShowTicketForm(true)}
                        className="absolute z-30 rounded-full flex items-center justify-center transition-all active:scale-95"
                        style={{
                            bottom: 'calc(80px + env(safe-area-inset-bottom, 0))',
                            right: 16,
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, var(--color-success), var(--color-accent-secondary))',
                            border: '2px solid var(--color-success-border)',
                            color: '#fff',
                            boxShadow: '0 8px 24px var(--color-success-bg), 0 0 0 4px var(--color-success-bg)',
                        }}
                        aria-label="Proposer un taux"
                        title="Proposer un taux au trader"
                    >
                        <Plus size={26} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* ─── Popup ticket reçu (PROPOSED ou COUNTERED_BY_TRADER) ─── */}
            {pendingTicket && <TicketPopup ticket={pendingTicket} />}

            {/* ─── ✅ Modale création par client ─── */}
            {showTicketForm && threadId && (
                <ClientTicketForm
                    threadId={threadId}
                    onClose={() => setShowTicketForm(false)}
                />
            )}
        </div>
    )
}