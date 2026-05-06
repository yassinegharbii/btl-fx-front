import { useEffect } from 'react'
import { X, Check, AlertCircle } from 'lucide-react'

import { useAcceptTicket, useDeclineTicket } from '@/hooks/useTickets'
import { queryClient } from '@/lib/queryClient'

import { TicketBadge } from './TicketBadge'
import { ExpiryBar }   from './ExpiryBar'

import type { Ticket } from '@/types/ticket.types'

interface Props {
    ticket: Ticket
}

export function TicketPopup({ ticket }: Props) {
    const accept  = useAcceptTicket()
    const decline = useDeclineTicket()

    /* ─── Auto-refresh à expiration ─── */
    useEffect(() => {
        if (!ticket.valid_until) return

        const end = new Date(ticket.valid_until).getTime()
        const remaining = end - Date.now()

        if (remaining <= 0) {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            return
        }

        const timer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
        }, remaining + 500)

        return () => clearTimeout(timer)
    }, [ticket.valid_until, ticket.order_id])

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4"
            style={{
                background: 'var(--color-bg-overlay)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    boxShadow: 'inset 0 0 120px var(--color-success-bg)',
                    animation: 'alertPulse 2s ease-in-out infinite',
                }}
            />

            {/* Mobile : fullscreen. Desktop : modale centrée. */}
            <div
                className="relative w-full sm:max-w-md sm:rounded-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh]"
                style={{
                    background: 'var(--color-bg-elevated)',
                    border: '2px solid var(--color-success-border)',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'fadeUp 0.3s ease-out',
                }}
            >
                {/* HEADER */}
                <div
                    className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center gap-3 flex-shrink-0"
                    style={{
                        background: 'var(--color-bg-tertiary)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'var(--color-success-bg)',
                            border: '1px solid var(--color-success-border)',
                        }}
                    >
                        <AlertCircle size={18} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-bold"
                            style={{ color: 'var(--color-text-primary)' }}>
                            Proposition de taux
                        </h2>
                        <p className="text-[11px] sm:text-xs mt-0.5"
                           style={{ color: 'var(--color-text-secondary)' }}>
                            Votre trader vous propose une transaction
                        </p>
                    </div>
                </div>

                {/* BODY scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Ref + statut */}
                    <div className="flex items-center justify-between">
                        <span className="font-mono-nums text-sm font-bold tracking-wide"
                              style={{ color: 'var(--color-text-primary)' }}>
                            {ticket.ref_ticket}
                        </span>
                        <TicketBadge status={ticket.order_status} />
                    </div>

                    {/* Opération */}
                    <div
                        className="text-center py-3 rounded-xl"
                        style={{
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        <div
                            className="text-[10px] uppercase tracking-widest mb-1"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            Opération
                        </div>
                        <div
                            className="text-lg sm:text-xl font-bold"
                            style={{
                                color: ticket.operation === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)',
                            }}
                        >
                            {ticket.operation === 'BUY' ? '▲ Achat' : '▼ Vente'} {ticket.currency_code}
                        </div>
                    </div>

                    {/* Grille infos */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <InfoCard
                            label="Montant"
                            value={ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                            unit={ticket.currency_code ?? ''}
                        />
                        <InfoCard
                            label="Mode"
                            value={formatDeliveryMode(ticket.delivery_mode)}
                        />
                        <InfoCard
                            label="Agence"
                            value={ticket.branch_name ?? ticket.branch_code}
                        />
                        <InfoCard
                            label="Équivalent"
                            value={ticket.tnd_equivalent?.toLocaleString('fr-FR', { minimumFractionDigits: 3 }) ?? '—'}
                            unit="TND"
                        />
                    </div>

                    {/* Taux négocié */}
                    <div
                        className="text-center py-3 sm:py-4 rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-success-bg), var(--color-bg-tertiary))',
                            border: '1px solid var(--color-success-border)',
                        }}
                    >
                        <div className="text-[10px] uppercase tracking-widest mb-1"
                             style={{ color: 'var(--color-text-secondary)' }}>
                            Taux négocié
                        </div>
                        <div className="font-mono-nums text-2xl sm:text-3xl font-bold"
                             style={{ color: 'var(--color-text-primary)' }}>
                            {ticket.negotiated_price?.toFixed(4)}
                        </div>
                        {ticket.market_rate_used != null && (
                            <div className="text-[10px] mt-1.5 font-mono-nums"
                                 style={{ color: 'var(--color-text-tertiary)' }}>
                                Marché : <span className="font-semibold">{ticket.market_rate_used.toFixed(4)}</span>
                            </div>
                        )}
                    </div>

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
                            « {ticket.trader_comment} »
                        </div>
                    )}

                    {/* Coupures */}
                    {ticket.bills && ticket.bills.length > 0 && (
                        <div
                            className="px-3 py-2.5 rounded-lg space-y-2"
                            style={{
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wider"
                                      style={{ color: 'var(--color-text-secondary)' }}>
                                    Coupures {ticket.currency_code}
                                </span>
                                <span className="text-[10px] font-mono-nums"
                                      style={{ color: 'var(--color-text-tertiary)' }}>
                                    {ticket.bills.reduce((n, b) => n + b.quantity, 0)} billets
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {ticket.bills.map((b) => (
                                    <div
                                        key={b.id}
                                        className="flex items-center justify-between px-2.5 py-1.5 rounded"
                                        style={{
                                            background: 'var(--color-success-bg)',
                                            border: '1px solid var(--color-success-border)',
                                        }}
                                    >
                                        <span className="text-xs font-mono-nums font-semibold"
                                              style={{ color: 'var(--color-text-primary)' }}>
                                            {b.bill_value}
                                            <span className="text-[9px] ml-1 font-normal"
                                                  style={{ color: 'var(--color-text-secondary)' }}>
                                                {ticket.currency_code}
                                            </span>
                                        </span>
                                        <span className="text-[11px] font-mono-nums font-bold"
                                              style={{ color: 'var(--color-success)' }}>
                                            × {b.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Barre d'expiration */}
                    <ExpiryBar validUntil={ticket.valid_until} createdAt={ticket.created_at} />
                </div>

                {/* ACTIONS */}
                <div
                    className="p-3 sm:p-4 grid grid-cols-2 gap-3 border-t flex-shrink-0"
                    style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-tertiary)',
                    }}
                >
                    <button
                        disabled={decline.isPending || accept.isPending}
                        onClick={() => decline.mutate(ticket.order_id)}
                        className="py-3.5 rounded-xl font-semibold text-sm transition-all
                                   active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 min-h-[48px]"
                        style={{
                            background: 'var(--color-danger-bg)',
                            border: '1px solid var(--color-danger-border)',
                            color: 'var(--color-danger)',
                        }}
                    >
                        <X size={16} />
                        Refuser
                    </button>
                    <button
                        disabled={decline.isPending || accept.isPending}
                        onClick={() => accept.mutate(ticket.order_id)}
                        className="py-3.5 rounded-xl font-semibold text-sm transition-all
                                   active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 text-white min-h-[48px]"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))',
                            border: '1px solid var(--color-success-border)',
                            boxShadow: 'var(--shadow-glow)',
                        }}
                    >
                        <Check size={16} />
                        {accept.isPending ? 'Acceptation...' : 'Accepter'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes alertPulse {
                    0%, 100% { opacity: 0.6; }
                    50%       { opacity: 1; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

function InfoCard({
                      label, value, unit,
                  }: {
    label: string
    value: string
    unit?: string
}) {
    return (
        <div
            className="px-3 py-2 rounded-lg"
            style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-subtle)',
            }}
        >
            <div className="text-[9px] uppercase tracking-wider mb-1"
                 style={{ color: 'var(--color-text-tertiary)' }}>
                {label}
            </div>
            <div className="font-mono-nums text-sm font-semibold truncate"
                 style={{ color: 'var(--color-text-primary)' }}>
                {value}
                {unit && (
                    <span className="text-[10px] ml-1 font-normal"
                          style={{ color: 'var(--color-text-secondary)' }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    )
}

function formatDeliveryMode(mode: string): string {
    const labels: Record<string, string> = {
        CASH:      'Espèces',
        ACCOUNT:   'Virement compte',
        TRANSFER:  'Virement externe',
        CHEQUE:    'Chèque',
        BORDEREAU: 'Bordereau',
    }
    return labels[mode] ?? mode
}