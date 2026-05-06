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

interface SystemConfigItem {
    icon:     LucideIcon
    label:    string
    /** Variable CSS du token couleur sémantique */
    semantic: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'accent'
}

const SYSTEM_CONFIG: Record<string, SystemConfigItem> = {
    TICKET_CREATED:    { icon: FileText,   label: 'Ticket proposé',  semantic: 'accent'  },
    TICKET_ACCEPTED:   { icon: CheckCheck, label: 'Ticket accepté',  semantic: 'success' },
    TICKET_DECLINED:   { icon: X,          label: 'Ticket refusé',   semantic: 'danger'  },
    TICKET_EXPIRED:    { icon: Clock,      label: 'Ticket expiré',   semantic: 'neutral' },
    BRANCH_CONFIRMED:  { icon: Building2,  label: 'Pris en charge',  semantic: 'info'    },
    BRANCH_COMPLETED:  { icon: CheckCheck, label: 'Finalisé',        semantic: 'success' },
}

/** Mapping semantic → variables CSS */
function getSemanticVars(semantic: SystemConfigItem['semantic']) {
    if (semantic === 'accent') {
        return {
            color:  'var(--color-text-secondary)',
            bg:     'var(--color-success-bg)',
            border: 'var(--color-success-border)',
        }
    }
    return {
        color:  `var(--color-${semantic})`,
        bg:     `var(--color-${semantic}-bg)`,
        border: `var(--color-${semantic}-border)`,
    }
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

    /* ─── Message système (ticket, branche, etc.) ─────────────────────── */
    if (SYSTEM_TYPES.includes(message.message_type)) {
        const config = SYSTEM_CONFIG[message.message_type]
        const ref = extractRefFromContent(message.content)
        const Icon = config.icon
        const vars = getSemanticVars(config.semantic)

        return (
            <div className="flex justify-center py-1 px-1">
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full max-w-full"
                    style={{
                        background: vars.bg,
                        border: `1px solid ${vars.border}`,
                    }}
                >
                    <Icon size={11} style={{ color: vars.color, flexShrink: 0 }} />
                    <span
                        className="text-[11px] font-medium whitespace-nowrap"
                        style={{ color: vars.color }}
                    >
                        {config.label}
                    </span>
                    {ref && (
                        <span
                            className="text-[10px] font-mono-nums font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                            style={{
                                background: 'var(--color-bg-input)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            {ref}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    /* ─── Message texte normal ──────────────────────────────────────── */
    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} my-1`}>
            <div className="max-w-[85%] sm:max-w-[70%] flex flex-col">
                <div
                    className="px-3 py-2 rounded-2xl text-sm break-words"
                    style={{
                        background: isMine
                            ? 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))'
                            : 'var(--color-bg-card)',
                        border: isMine
                            ? '1px solid var(--color-success-border)'
                            : '1px solid var(--color-border)',
                        color: isMine ? '#fff' : 'var(--color-text-primary)',
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
                    <span className="text-[9px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formatTime(message.created_at)}
                    </span>
                    {isMine && (
                        <>
                            {message.status === 'READ' && (
                                <CheckCheck size={11} style={{ color: 'var(--color-success)' }} />
                            )}
                            {message.status === 'DELIVERED' && (
                                <CheckCheck size={11} style={{ color: 'var(--color-text-secondary)' }} />
                            )}
                            {message.status === 'SENT' && (
                                <Check size={11} style={{ color: 'var(--color-text-secondary)' }} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}