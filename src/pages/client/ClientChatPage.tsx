import { useEffect, useRef, useState } from 'react'
import { LogOut, TrendingUp } from 'lucide-react'

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
import { Spinner }           from '@/components/ui/Spinner'
import { MobileDrawer }      from '@/components/ui/MobileDrawer'
import { queryClient }       from '@/lib/queryClient'

export default function ClientChatPage() {
    const { data: thread, isLoading } = useMyThread()
    const logout   = useAuthStore((s) => s.logout)
    const messages = useChatStore((s) => s.messages)
    const typing   = useChatStore((s) => s.typing)
    const presence = useChatStore((s) => s.presence)

    const isMobile = useIsMobile()
    const [showRatesDrawer, setShowRatesDrawer] = useState(false)

    const threadId = thread?.thread_id ?? null
    const { send } = useWebSocket(threadId)
    const bottomRef = useRef<HTMLDivElement>(null)

    const { data: tickets } = useThreadTickets(threadId)
    const pendingTicket = tickets?.find((t) => t.order_status === 'PROPOSED')

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
            <div className="flex h-screen items-center justify-center" style={{ background: '#070d09' }}>
                <Spinner />
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#070d09' }}>

            {/* ─── DESKTOP : sidebar fixe ─── */}
            {!isMobile && (
                <aside className="w-60 flex-shrink-0">
                    <RateSidebar />
                </aside>
            )}

            {/* ─── MOBILE : drawer ─── */}
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

                {/* ─── HEADER ─── */}
                <div
                    className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b flex-shrink-0 gap-2"
                    style={{
                        background: 'rgba(15, 58, 26, 0.8)',
                        borderColor: 'rgba(42, 128, 64, 0.3)',
                    }}
                >
                    {isMobile && (
                        <button
                            onClick={() => setShowRatesDrawer(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                            style={{
                                background: 'rgba(74, 222, 128, 0.12)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                color: '#4ade80',
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
                                background: 'rgba(42, 128, 64, 0.25)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                            }}
                        >
                            <span className="text-[10px] sm:text-xs font-bold" style={{ color: '#4ade80' }}>
                                BTL
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13px] sm:text-sm font-semibold text-white truncate">
                                    {isMobile ? 'Salle des marchés' : 'Salle des marchés BTL'}
                                </span>
                                {traderId && (
                                    <PresenceDot
                                        userId={traderId}
                                        fallbackOnline={thread?.trader_online ?? false}
                                    />
                                )}
                            </div>
                            <span className="text-[10px] sm:text-[11px] truncate block" style={{ color: '#a8c4aa' }}>
                                {traderId
                                    ? isTraderTyping
                                        ? "en train d'écrire..."
                                        : isTraderOnline ? 'Trader disponible' : 'Trader hors ligne'
                                    : "En attente d'un trader"}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        title="Déconnexion"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95"
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

                {/* ─── MESSAGES ─── */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1.5 min-h-0">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="text-4xl mb-3">💱</div>
                            <p className="text-sm font-medium" style={{ color: '#a8c4aa' }}>
                                Bienvenue sur BTL-FX
                            </p>
                            <p className="text-xs mt-1 max-w-xs" style={{ color: '#5a8060' }}>
                                Envoyez un message à votre trader pour commencer une négociation
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
            </div>

            {pendingTicket && <TicketPopup ticket={pendingTicket} />}
        </div>
    )
}