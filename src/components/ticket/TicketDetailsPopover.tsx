import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Building2, Calendar, TrendingUp, TrendingDown, Hash, Clock } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { useIsMobile }  from '@/hooks/useIsMobile'
import { useTicketByRef } from '@/hooks/useTicketByRef'
import { getOperationLabel, getOperationSemantic } from '@/utils/operationLabels'

import { TicketBadge } from './TicketBadge'
import { Spinner } from '@/components/ui/Spinner'

interface Props {
    refTicket:  string | null
    anchorEl?:  HTMLElement | null   // pour le placement desktop
    onClose:    () => void
}

export function TicketDetailsPopover({ refTicket, anchorEl, onClose }: Props) {
    const isMobile = useIsMobile()
    const user     = useAuthStore((s) => s.user)
    const { data: ticket, isLoading } = useTicketByRef(refTicket)

    /* ─── Placement desktop ─── */
    const popoverRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null)

    useEffect(() => {
        if (isMobile || !anchorEl || !popoverRef.current) return

        const anchor   = anchorEl.getBoundingClientRect()
        const popover  = popoverRef.current.getBoundingClientRect()
        const margin   = 8
        const winW     = window.innerWidth
        const winH     = window.innerHeight

        // Tente d'afficher au-dessus de l'ancre, sinon en-dessous
        const above = anchor.top - popover.height - margin
        const below = anchor.bottom + margin
        const placement: 'top' | 'bottom' = above > 10 ? 'top' : 'bottom'

        const top = placement === 'top' ? above : below

        // Centrage horizontal sur l'ancre, clamp dans la fenêtre
        let left = anchor.left + anchor.width / 2 - popover.width / 2
        left = Math.max(margin, Math.min(left, winW - popover.width - margin))

        // S'assure que ça reste à l'écran verticalement
        const finalTop = Math.max(margin, Math.min(top, winH - popover.height - margin))

        setPos({ top: finalTop, left, placement })
    }, [anchorEl, ticket, isMobile])

    /* Lock body scroll on mobile */
    useEffect(() => {
        if (!isMobile) return
        const original = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = original }
    }, [isMobile])

    if (!refTicket) return null

    /* ─── Contenu commun ─── */
    const content = (
        <>
            {isLoading && (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            )}

            {!isLoading && !ticket && (
                <div className="py-6 text-center">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Ticket introuvable
                    </p>
                    <p className="text-[11px] mt-1 font-mono-nums" style={{ color: 'var(--color-text-tertiary)' }}>
                        {refTicket}
                    </p>
                </div>
            )}

            {!isLoading && ticket && (
                <TicketContent ticket={ticket} userRole={user?.role} />
            )}
        </>
    )

    /* ─── Mobile : full modal ─── */
    if (isMobile) {
        return createPortal(
            <div
                className="fixed inset-0 z-[120] flex items-end"
                style={{
                    background: 'var(--color-bg-overlay)',
                    backdropFilter: 'blur(8px)',
                }}
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-t-2xl overflow-hidden flex flex-col"
                    style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-strong)',
                        maxHeight: '85vh',
                        animation: 'slideUp 0.3s ease-out',
                    }}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-2 pb-1">
                        <div className="w-10 h-1 rounded-full"
                             style={{ background: 'var(--color-border-strong)' }} />
                    </div>

                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Hash size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                            <span className="font-mono-nums text-sm font-bold truncate"
                                  style={{ color: 'var(--color-text-primary)' }}>
                                {refTicket}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'var(--color-bg-input)',
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div
                        className="flex-1 overflow-y-auto p-4"
                        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0))' }}
                    >
                        {content}
                    </div>
                </div>

                <style>{`
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to   { transform: translateY(0); }
                    }
                `}</style>
            </div>,
            document.body,
        )
    }

    /* ─── Desktop : popover positionné ─── */
    return createPortal(
        <>
            {/* Backdrop pour fermer au clic extérieur */}
            <div
                className="fixed inset-0 z-[110]"
                onClick={onClose}
                style={{ background: 'transparent' }}
            />

            <div
                ref={popoverRef}
                className="fixed z-[120] rounded-xl overflow-hidden"
                style={{
                    top:  pos?.top  ?? -9999,
                    left: pos?.left ?? -9999,
                    width: 360,
                    maxHeight: '85vh',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-strong)',
                    boxShadow: 'var(--shadow-lg)',
                    visibility: pos ? 'visible' : 'hidden',
                    animation: 'popoverFade 0.15s ease-out',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-2.5 border-b"
                    style={{
                        background: 'var(--color-bg-tertiary)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Hash size={13} style={{ color: 'var(--color-text-tertiary)' }} />
                        <span className="font-mono-nums text-xs font-bold"
                              style={{ color: 'var(--color-text-primary)' }}>
                            {refTicket}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                            background: 'var(--color-bg-input)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        <X size={13} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 50px)' }}>
                    {content}
                </div>
            </div>

            <style>{`
                @keyframes popoverFade {
                    from { opacity: 0; transform: scale(0.96); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>,
        document.body,
    )
}

/* ─── Contenu détails du ticket ─── */
function TicketContent({
                           ticket,
                           userRole,
                       }: {
    ticket: import('@/types/ticket.types').Ticket
    userRole?: string
}) {
    const opLabel    = getOperationLabel(ticket.operation, userRole as 'CLIENT' | 'TRADER' | undefined)
    const opSemantic = getOperationSemantic(ticket.operation, userRole as 'CLIENT' | 'TRADER' | undefined)
    const isClient   = userRole === 'CLIENT'

    const formatDate = (iso: string | null) => {
        if (!iso) return '—'
        const d = new Date(iso)
        return d.toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit',
        })
    }

    const createdByLabel = ticket.created_by_role === 'CLIENT'
        ? (isClient ? 'Vous' : 'Le client')
        : (isClient ? 'Le trader' : 'Vous')

    return (
        <div className="space-y-3">

            {/* Statut + opération */}
            <div className="flex items-center justify-between gap-2">
                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                        background: `var(--color-${opSemantic}-bg)`,
                        color: `var(--color-${opSemantic})`,
                        border: `1px solid var(--color-${opSemantic}-border)`,
                    }}
                >
                    {opSemantic === 'success'
                        ? <TrendingUp size={12} />
                        : <TrendingDown size={12} />}
                    {opLabel} {ticket.currency_code}
                </div>
                <TicketBadge status={ticket.order_status} />
            </div>

            {/* Montant + Taux mis en avant */}
            <div
                className="grid grid-cols-2 gap-2 p-3 rounded-xl"
                style={{
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border-subtle)',
                }}
            >
                <div>
                    <div className="text-[9px] uppercase tracking-wider"
                         style={{ color: 'var(--color-text-tertiary)' }}>
                        Montant
                    </div>
                    <div className="font-mono-nums text-base font-bold mt-0.5"
                         style={{ color: 'var(--color-text-primary)' }}>
                        {ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                        <span className="text-[10px] ml-1 font-normal"
                              style={{ color: 'var(--color-text-secondary)' }}>
                            {ticket.currency_code}
                        </span>
                    </div>
                </div>
                <div>
                    <div className="text-[9px] uppercase tracking-wider"
                         style={{ color: 'var(--color-text-tertiary)' }}>
                        Taux négocié
                    </div>
                    <div className="font-mono-nums text-base font-bold mt-0.5"
                         style={{ color: 'var(--color-success)' }}>
                        {ticket.negotiated_price?.toFixed(4) ?? '—'}
                    </div>
                </div>
            </div>

            {/* Équivalent TND */}
            {ticket.tnd_equivalent && (
                <div
                    className="px-3 py-2 rounded-lg text-center"
                    style={{
                        background: 'var(--color-success-bg)',
                        border: '1px solid var(--color-success-border)',
                    }}
                >
                    <div className="text-[9px] uppercase tracking-widest font-semibold"
                         style={{ color: 'var(--color-text-secondary)' }}>
                        Équivalent
                    </div>
                    <div className="font-mono-nums text-lg font-bold"
                         style={{ color: 'var(--color-text-primary)' }}>
                        {ticket.tnd_equivalent.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                        <span className="text-xs ml-1 font-normal"
                              style={{ color: 'var(--color-text-secondary)' }}>
                            TND
                        </span>
                    </div>
                </div>
            )}

            {/* Métadata */}
            <div className="space-y-1.5 text-xs">
                <Row
                    icon={<Building2 size={11} />}
                    label="Agence"
                    value={ticket.branch_name ?? ticket.branch_code}
                />
                <Row
                    icon={<Hash size={11} />}
                    label="Créé par"
                    value={createdByLabel}
                />
                <Row
                    icon={<Calendar size={11} />}
                    label="Créé le"
                    value={formatDate(ticket.created_at)}
                />
                {ticket.valid_until && (
                    <Row
                        icon={<Clock size={11} />}
                        label="Valide jusqu'à"
                        value={formatDate(ticket.valid_until)}
                    />
                )}
                {ticket.client_decision_at && (
                    <Row
                        icon={<Calendar size={11} />}
                        label="Décision"
                        value={formatDate(ticket.client_decision_at)}
                    />
                )}
                {ticket.market_rate_used && (
                    <Row
                        icon={<TrendingUp size={11} />}
                        label="Taux marché"
                        value={ticket.market_rate_used.toFixed(4)}
                    />
                )}
            </div>

            {/* Commentaire client */}
            {ticket.client_comment && (
                <div
                    className="px-3 py-2 rounded-lg italic text-xs"
                    style={{
                        background: 'var(--color-warning-bg)',
                        borderLeft: '2px solid var(--color-warning)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    <div className="text-[9px] uppercase tracking-wider not-italic mb-0.5 font-semibold"
                         style={{ color: 'var(--color-warning)' }}>
                        Client
                    </div>
                    « {ticket.client_comment} »
                </div>
            )}

            {/* Commentaire trader */}
            {ticket.trader_comment && (
                <div
                    className="px-3 py-2 rounded-lg italic text-xs"
                    style={{
                        background: 'var(--color-success-bg)',
                        borderLeft: '2px solid var(--color-accent-secondary)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    <div className="text-[9px] uppercase tracking-wider not-italic mb-0.5 font-semibold"
                         style={{ color: 'var(--color-accent-secondary)' }}>
                        Trader
                    </div>
                    « {ticket.trader_comment} »
                </div>
            )}
        </div>
    )
}

function Row({
                 icon, label, value,
             }: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5"
                  style={{ color: 'var(--color-text-tertiary)' }}>
                {icon}
                <span className="text-[10px] uppercase tracking-wider">{label}</span>
            </span>
            <span className="font-mono-nums text-xs font-medium text-right"
                  style={{ color: 'var(--color-text-primary)' }}>
                {value}
            </span>
        </div>
    )
}