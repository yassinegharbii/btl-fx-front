import { useState, useRef, useEffect } from 'react'
import { CheckCheck, Check, FileText, X, Clock, Building2, UserPlus, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useIsMobile }  from '@/hooks/useIsMobile'
import { TicketDetailsPopover } from '@/components/ticket/TicketDetailsPopover'
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
    'TICKET_CREATED_BY_CLIENT',
    'TICKET_ACCEPTED_BY_TRADER',
    'TICKET_DECLINED_BY_TRADER',
    'TICKET_COUNTERED',
] as MessageType[]

interface SystemConfigItem {
    icon:     LucideIcon
    label:    string
    semantic: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'accent'
}

const SYSTEM_CONFIG: Record<string, SystemConfigItem> = {
    TICKET_CREATED:    { icon: FileText,   label: 'Ticket proposé',  semantic: 'accent'  },
    TICKET_ACCEPTED:   { icon: CheckCheck, label: 'Ticket accepté',  semantic: 'success' },
    TICKET_DECLINED:   { icon: X,          label: 'Ticket refusé',   semantic: 'danger'  },
    TICKET_EXPIRED:    { icon: Clock,      label: 'Ticket expiré',   semantic: 'neutral' },
    BRANCH_CONFIRMED:  { icon: Building2,  label: 'Pris en charge',  semantic: 'info'    },
    BRANCH_COMPLETED:  { icon: CheckCheck, label: 'Finalisé',        semantic: 'success' },
    TICKET_CREATED_BY_CLIENT:   { icon: UserPlus,   label: 'Demande client',         semantic: 'warning' },
    TICKET_ACCEPTED_BY_TRADER:  { icon: CheckCheck, label: 'Accepté par le trader',  semantic: 'success' },
    TICKET_DECLINED_BY_TRADER:  { icon: X,          label: 'Refusé par le trader',   semantic: 'danger'  },
    TICKET_COUNTERED:           { icon: RefreshCw,  label: 'Contre-proposition',     semantic: 'info'    },
}

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
    const isMobile = useIsMobile()

    /* ─── État popover ─── */
    const [popoverOpen, setPopoverOpen] = useState(false)
    const bubbleRef = useRef<HTMLDivElement>(null)

    /* Sur desktop : ouvre au hover après un petit délai (anti-flicker) */
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const handleMouseEnter = () => {
        if (isMobile) return
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        hoverTimeout.current = setTimeout(() => setPopoverOpen(true), 250)
    }
    const handleMouseLeave = () => {
        if (isMobile) return
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    }

    useEffect(() => {
        return () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        }
    }, [])

    /* ─── Message système (ticket, branche, etc.) ─── */
    if (SYSTEM_TYPES.includes(message.message_type)) {
        const config = SYSTEM_CONFIG[message.message_type] ?? SYSTEM_CONFIG.TICKET_CREATED
        const ref = extractRefFromContent(message.content)
        const Icon = config.icon
        const vars = getSemanticVars(config.semantic)

        /* Clic seulement actif s'il y a une ref */
        const isClickable = !!ref

        return (
            <>
                <div className="flex justify-center py-1 px-1">
                    <div
                        ref={bubbleRef}
                        onClick={() => { if (isClickable) setPopoverOpen(true) }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full max-w-full transition-all ${
                            isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
                        }`}
                        style={{
                            background: vars.bg,
                            border: `1px solid ${vars.border}`,
                        }}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        title={isClickable ? 'Voir les détails du ticket' : undefined}
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

                {/* ✅ Popover détails ticket */}
                {popoverOpen && ref && (
                    <TicketDetailsPopover
                        refTicket={ref}
                        anchorEl={bubbleRef.current}
                        onClose={() => setPopoverOpen(false)}
                    />
                )}
            </>
        )
    }

    /* ─── Message texte normal ─── */
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