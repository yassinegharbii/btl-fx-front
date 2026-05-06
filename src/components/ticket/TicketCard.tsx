import { useThreadTickets, useAcceptTicket, useDeclineTicket } from '@/hooks/useTickets'
import { useAuthStore } from '@/stores/auth.store'
import { TicketBadge } from './TicketBadge'
import { ExpiryBar } from './ExpiryBar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Ticket } from '@/types/ticket.types'

interface Props { threadId: number }

export function TicketCard({ threadId }: Props) {
    const { data: tickets, isLoading } = useThreadTickets(threadId)
    const user = useAuthStore((s) => s.user)

    if (isLoading) return (
        <div className="flex justify-center py-4">
            <Spinner />
        </div>
    )

    const active = tickets?.find(
        (t) => t.order_status === 'PROPOSED' || t.order_status === 'ACCEPTED_BY_CLIENT'
    )

    if (!active) return null

    return (
        <div className="my-2 flex justify-start px-2 sm:px-0">
            <TicketCardInner ticket={active} isClient={user?.role === 'CLIENT'} />
        </div>
    )
}

function TicketCardInner({ ticket, isClient }: { ticket: Ticket; isClient: boolean }) {
    const accept  = useAcceptTicket()
    const decline = useDeclineTicket()

    const isProposed = ticket.order_status === 'PROPOSED'

    return (
        <div className="w-full sm:w-72 rounded-2xl p-3 sm:p-4 space-y-3"
             style={{
                 background: 'var(--color-bg-card)',
                 border: '1px solid var(--color-border)',
             }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="font-mono-nums text-[11px] tracking-wide"
                      style={{ color: 'var(--color-text-tertiary)' }}>
                    {ticket.ref_ticket}
                </span>
                <TicketBadge status={ticket.order_status} />
            </div>

            {/* Infos */}
            <div className="space-y-1.5">
                <TicketRow label="Opération" value={
                    <span style={{ color: ticket.operation === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {ticket.operation === 'BUY' ? 'Achat' : 'Vente'} {ticket.currency_code}
                    </span>
                } />
                <TicketRow label="Montant"
                           value={`${ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} ${ticket.currency_code}`}
                />
                <TicketRow label="Mode" value={ticket.delivery_mode} />
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
                    Taux négocié
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

            {/* Commentaire trader */}
            {ticket.trader_comment && (
                <p className="text-xs italic border-l-2 pl-2"
                   style={{
                       color: 'var(--color-text-secondary)',
                       borderColor: 'var(--color-border)',
                   }}>
                    {ticket.trader_comment}
                </p>
            )}

            {/* Barre d'expiration */}
            {isProposed && <ExpiryBar validUntil={ticket.valid_until} createdAt={ticket.created_at} />}

            {/* Actions client */}
            {isClient && isProposed && (
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