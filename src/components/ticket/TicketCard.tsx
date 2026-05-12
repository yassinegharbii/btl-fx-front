import { useThreadTickets, useAcceptTicket, useDeclineTicket } from '@/hooks/useTickets'
import { useAuthStore } from '@/stores/auth.store'
import { getOperationLabel, getOperationSemantic } from '@/utils/operationLabels'  // ✅ NEW
import { TicketBadge } from './TicketBadge'
import { ExpiryBar } from './ExpiryBar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Ticket } from '@/types/ticket.types'

interface Props { threadId: number }

const ACTIVE_STATUSES = [
    'PROPOSED',
    'PROPOSED_BY_CLIENT',
    'COUNTERED_BY_TRADER',
    'ACCEPTED_BY_CLIENT',
    'ACCEPTED_BY_TRADER',
] as const

export function TicketCard({ threadId }: Props) {
    const { data: tickets, isLoading } = useThreadTickets(threadId)
    const user = useAuthStore((s) => s.user)

    if (isLoading) return (
        <div className="flex justify-center py-4">
            <Spinner />
        </div>
    )

    const active = tickets?.find((t) =>
        ACTIVE_STATUSES.includes(t.order_status as typeof ACTIVE_STATUSES[number])
    )

    if (!active) return null

    return (
        <div className="my-2 flex justify-start px-2 sm:px-0">
            <TicketCardInner ticket={active} userRole={user?.role} />
        </div>
    )
}

function TicketCardInner({ ticket, userRole }: { ticket: Ticket; userRole?: string }) {
    const accept  = useAcceptTicket()
    const decline = useDeclineTicket()

    const isClient = userRole === 'CLIENT'

    const canClientAct =
        isClient && (
            ticket.order_status === 'PROPOSED' ||
            ticket.order_status === 'COUNTERED_BY_TRADER'
        )

    const showExpiryBar = ticket.valid_until && (
        ticket.order_status === 'PROPOSED' ||
        ticket.order_status === 'COUNTERED_BY_TRADER'
    )

    /* ✅ Label inversé selon perspective */
    const opLabel    = getOperationLabel(ticket.operation, userRole as 'CLIENT' | 'TRADER' | undefined)
    const opSemantic = getOperationSemantic(ticket.operation, userRole as 'CLIENT' | 'TRADER' | undefined)

    /* Label en haut selon le créateur (perspective viewer) */
    const createdByLabel = ticket.created_by_role === 'CLIENT'
        ? (isClient ? 'Ma demande' : 'Demande client')
        : (isClient ? 'Proposition trader' : 'Ma proposition')

    return (
        <div className="w-full sm:w-72 rounded-2xl p-3 sm:p-4 space-y-3"
             style={{
                 background: 'var(--color-bg-card)',
                 border: '1px solid var(--color-border)',
             }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="font-mono-nums text-[11px] tracking-wide"
                          style={{ color: 'var(--color-text-tertiary)' }}>
                        {ticket.ref_ticket}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5"
                          style={{ color: 'var(--color-text-tertiary)' }}>
                        {createdByLabel}
                    </span>
                </div>
                <TicketBadge status={ticket.order_status} />
            </div>

            {/* Infos */}
            <div className="space-y-1.5">
                <TicketRow label="Opération" value={
                    <span style={{ color: `var(--color-${opSemantic})` }}>
                        {opLabel} {ticket.currency_code}
                    </span>
                } />
                <TicketRow label="Montant"
                           value={`${ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} ${ticket.currency_code}`}
                />
                <TicketRow label="Agence" value={ticket.branch_name ?? ticket.branch_code} />
            </div>

            {/* Taux négocié */}
            <div className="rounded-xl py-3 text-center"
                 style={{
                     background: 'var(--color-bg-tertiary)',
                     border: '1px solid var(--color-border-subtle)',
                 }}>
                <div className="text-[10px] uppercase tracking-widest mb-1"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                    {ticket.order_status === 'COUNTERED_BY_TRADER' ? 'Nouveau taux' : 'Taux négocié'}
                </div>
                <div className="font-mono-nums text-2xl font-semibold"
                     style={{ color: 'var(--color-text-primary)' }}>
                    {ticket.negotiated_price?.toFixed(4)}
                    <span className="text-sm ml-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        TND
                    </span>
                </div>
                {ticket.tnd_equivalent && (
                    <div className="text-xs font-mono-nums mt-1"
                         style={{ color: 'var(--color-text-tertiary)' }}>
                        = {ticket.tnd_equivalent.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                    </div>
                )}
            </div>

            {/* Commentaire client (si présent) */}
            {ticket.client_comment && (
                <p className="text-xs italic border-l-2 pl-2"
                   style={{
                       color: 'var(--color-text-secondary)',
                       borderColor: 'var(--color-warning)',
                   }}>
                    <span className="text-[10px] uppercase tracking-wider not-italic block mb-0.5 font-semibold"
                          style={{ color: 'var(--color-warning)' }}>
                        Client
                    </span>
                    {ticket.client_comment}
                </p>
            )}

            {/* Commentaire trader (si présent) */}
            {ticket.trader_comment && (
                <p className="text-xs italic border-l-2 pl-2"
                   style={{
                       color: 'var(--color-text-secondary)',
                       borderColor: 'var(--color-accent-secondary)',
                   }}>
                    <span className="text-[10px] uppercase tracking-wider not-italic block mb-0.5 font-semibold"
                          style={{ color: 'var(--color-accent-secondary)' }}>
                        Trader
                    </span>
                    {ticket.trader_comment}
                </p>
            )}

            {showExpiryBar && <ExpiryBar validUntil={ticket.valid_until} createdAt={ticket.created_at} />}

            {canClientAct && (
                <div className="flex gap-2 pt-1">
                    <Button
                        variant="success"
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        loading={accept.isPending}
                        onClick={() => accept.mutate(ticket.order_id)}
                    >
                        Accepter
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        loading={decline.isPending}
                        onClick={() => decline.mutate(ticket.order_id)}
                    >
                        Refuser
                    </Button>
                </div>
            )}

            {isClient && ticket.order_status === 'PROPOSED_BY_CLIENT' && (
                <div className="text-center py-2 text-[11px]"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                    ⏳ En attente de réponse du trader...
                </div>
            )}
        </div>
    )
}

function TicketRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {label}
            </span>
            <span className="text-xs font-mono-nums" style={{ color: 'var(--color-text-primary)' }}>
                {value}
            </span>
        </div>
    )
}