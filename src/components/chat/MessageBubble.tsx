import { CheckCheck, Check, FileText, X, Clock, Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import type { Message, MessageType } from '@/types/chat.types'

interface Props {
    message: Message
}

const SYSTEM_TYPES: MessageType[] = [
    'TICKET_CREATED',
    'TICKET_ACCEPTED',
    'TICKET_DECLINED',
    'TICKET_EXPIRED',
    'BRANCH_CONFIRMED',
    'BRANCH_COMPLETED',
]

const SYSTEM_CONFIG: Record<string, {
    icon: LucideIcon
    label: string
    color: string
    bg: string
    border: string
}> = {
    TICKET_CREATED:    { icon: FileText,   label: 'Ticket proposé',         color: '#a8c4aa',  bg: 'rgba(74, 222, 128, 0.10)',  border: 'rgba(74, 222, 128, 0.25)' },
    TICKET_ACCEPTED:   { icon: CheckCheck, label: 'Ticket accepté',         color: '#4ade80',  bg: 'rgba(74, 222, 128, 0.15)',  border: 'rgba(74, 222, 128, 0.35)' },
    TICKET_DECLINED:   { icon: X,          label: 'Ticket refusé',          color: '#fb7185',  bg: 'rgba(251, 113, 133, 0.10)', border: 'rgba(251, 113, 133, 0.30)' },
    TICKET_EXPIRED:    { icon: Clock,      label: 'Ticket expiré',          color: '#94a3b8',  bg: 'rgba(148, 163, 184, 0.10)', border: 'rgba(148, 163, 184, 0.25)' },
    BRANCH_CONFIRMED:  { icon: Building2,  label: 'Pris en charge',         color: '#60a5fa',  bg: 'rgba(96, 165, 250, 0.10)',  border: 'rgba(96, 165, 250, 0.30)' },
    BRANCH_COMPLETED:  { icon: CheckCheck, label: 'Finalisé',               color: '#4ade80',  bg: 'rgba(74, 222, 128, 0.15)',  border: 'rgba(74, 222, 128, 0.35)' },
}

function extractRefFromContent(content: string | null): string | null {
    if (!content) return null
    const m = content.match(/FX-\d+/)
    return m ? m[0] : null
}

function formatTime(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message }: Props) {
    const currentUserId = useAuthStore((s) => s.user?.user_id)
    const isMine = message.sender_user_id === currentUserId

    // ─── Message système (ticket, branche, etc.) ─────────────────────
    if (SYSTEM_TYPES.includes(message.message_type)) {
        const config = SYSTEM_CONFIG[message.message_type]
        const ref = extractRefFromContent(message.content)
        const Icon = config.icon

        return (
            <div className="flex justify-center py-1 px-1">
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full max-w-full"
                    style={{
                        background: config.bg,
                        border: `1px solid ${config.border}`,
                    }}
                >
                    <Icon size={11} style={{ color: config.color, flexShrink: 0 }} />
                    <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: config.color }}>
              {config.label}
            </span>
                    {ref && (
                        <span
                            className="text-[10px] font-mono-nums font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                color: '#fff',
                            }}
                        >
                  {ref}
                </span>
                    )}
                </div>
            </div>
        )
    }

    // ─── Message texte normal ─────────────────────────────────────────
    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} my-1`}>
            {/* ✅ max-w plus large sur mobile (85% au lieu de 70%) */}
            <div className="max-w-[85%] sm:max-w-[70%] flex flex-col">
                <div
                    className="px-3 py-2 rounded-2xl text-sm break-words"
                    style={{
                        background: isMine
                            ? 'linear-gradient(135deg, #2a8040, #1a5c2a)'
                            : 'rgba(15, 58, 26, 0.6)',
                        border: isMine
                            ? '1px solid rgba(74, 222, 128, 0.3)'
                            : '1px solid rgba(42, 128, 64, 0.25)',
                        color: '#fff',
                        borderBottomRightRadius: isMine ? '6px' : '16px',
                        borderBottomLeftRadius:  isMine ? '16px' : '6px',
                    }}
                >
                    {message.content}
                </div>
                <div
                    className={`flex items-center gap-1 mt-0.5 px-1 ${
                        isMine ? 'justify-end' : 'justify-start'
                    }`}
                >
            <span className="text-[9px]" style={{ color: '#5a8060' }}>
              {formatTime(message.created_at)}
            </span>
                    {isMine && (
                        <>
                            {message.status === 'READ' && (
                                <CheckCheck size={11} style={{ color: '#4ade80' }} />
                            )}
                            {message.status === 'DELIVERED' && (
                                <CheckCheck size={11} style={{ color: '#a8c4aa' }} />
                            )}
                            {message.status === 'SENT' && (
                                <Check size={11} style={{ color: '#a8c4aa' }} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}