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

    /* ─── Auto-refresh à expiration ──────────────────────────────────── */
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
                background: 'rgba(7, 17, 11, 0.85)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    boxShadow: 'inset 0 0 120px rgba(26,92,42,0.4)',
                    animation: 'alertPulse 2s ease-in-out infinite',
                }}
            />

            {/* ✅ Mobile : fullscreen plein écran. Desktop : modale centrée. */}
            <div
                className="relative w-full sm:max-w-md sm:rounded-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh]"
                style={{
                    background: 'linear-gradient(180deg, #0f3a1a 0%, #0a1f0e 100%)',
                    border: '2px solid rgba(42, 128, 64, 0.6)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(74, 222, 128, 0.15)',
                    animation: 'fadeUp 0.3s ease-out',
                }}
            >
                {/* HEADER */}
                <div
                    className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center gap-3 flex-shrink-0"
                    style={{
                        background: 'rgba(26, 92, 42, 0.3)',
                        borderColor: 'rgba(42, 128, 64, 0.3)',
                    }}
                >
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'rgba(74, 222, 128, 0.15)',
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                        }}
                    >
                        <AlertCircle size={18} style={{ color: '#4ade80' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-bold text-white">Proposition de taux</h2>
                        <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: '#a8c4aa' }}>
                            Votre trader vous propose une transaction
                        </p>
                    </div>
                </div>

                {/* BODY scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Ref + statut */}
                    <div className="flex items-center justify-between">
                        <span className="font-mono-nums text-sm font-bold text-white tracking-wide">
                            {ticket.ref_ticket}
                        </span>
                        <TicketBadge status={ticket.order_status} />
                    </div>

                    {/* Opération */}
                    <div
                        className="text-center py-3 rounded-xl"
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(42, 128, 64, 0.25)',
                        }}
                    >
                        <div
                            className="text-[10px] uppercase tracking-widest mb-1"
                            style={{ color: '#5a8060' }}
                        >
                            Opération
                        </div>
                        <div
                            className="text-lg sm:text-xl font-bold"
                            style={{
                                color: ticket.operation === 'BUY' ? '#4ade80' : '#fb7185',
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
                            background: 'linear-gradient(135deg, rgba(42, 128, 64, 0.25), rgba(74, 222, 128, 0.1))',
                            border: '1px solid rgba(74, 222, 128, 0.35)',
                        }}
                    >
                        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#a8c4aa' }}>
                            Taux négocié
                        </div>
                        <div className="font-mono-nums text-2xl sm:text-3xl font-bold text-white">
                            {ticket.negotiated_price?.toFixed(4)}
                        </div>
                        {ticket.market_rate_used != null && (
                            <div className="text-[10px] mt-1.5 font-mono-nums" style={{ color: '#5a8060' }}>
                                Marché : <span className="font-semibold">{ticket.market_rate_used.toFixed(4)}</span>
                            </div>
                        )}
                    </div>

                    {/* Commentaire trader */}
                    {ticket.trader_comment && (
                        <div
                            className="px-3 py-2 rounded-lg italic text-xs"
                            style={{
                                background: 'rgba(26, 92, 42, 0.2)',
                                borderLeft: '2px solid #2a8040',
                                color: '#e8f0e9',
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
                                background: 'rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(42, 128, 64, 0.25)',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wider" style={{ color: '#a8c4aa' }}>
                                    Coupures {ticket.currency_code}
                                </span>
                                <span className="text-[10px] font-mono-nums" style={{ color: '#5a8060' }}>
                                    {ticket.bills.reduce((n, b) => n + b.quantity, 0)} billets
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                {ticket.bills.map((b) => (
                                    <div
                                        key={b.id}
                                        className="flex items-center justify-between px-2.5 py-1.5 rounded"
                                        style={{
                                            background: 'rgba(42, 128, 64, 0.12)',
                                            border: '1px solid rgba(74, 222, 128, 0.15)',
                                        }}
                                    >
                                        <span className="text-xs font-mono-nums font-semibold text-white">
                                            {b.bill_value}
                                            <span className="text-[9px] ml-1 font-normal" style={{ color: '#a8c4aa' }}>
                                                {ticket.currency_code}
                                            </span>
                                        </span>
                                        <span className="text-[11px] font-mono-nums font-bold" style={{ color: '#4ade80' }}>
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

                {/* ACTIONS — boutons gros et tactiles */}
                <div
                    className="p-3 sm:p-4 grid grid-cols-2 gap-3 border-t flex-shrink-0"
                    style={{
                        borderColor: 'rgba(42, 128, 64, 0.3)',
                        background: 'rgba(0,0,0,0.2)',
                    }}
                >
                    <button
                        disabled={decline.isPending || accept.isPending}
                        onClick={() => decline.mutate(ticket.order_id)}
                        className="py-3.5 rounded-xl font-semibold text-sm transition-all
                                   active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 min-h-[48px]"
                        style={{
                            background: 'rgba(251, 113, 133, 0.12)',
                            border: '1px solid rgba(251, 113, 133, 0.3)',
                            color: '#fb7185',
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
                            background: 'linear-gradient(135deg, #2a8040, #1a5c2a)',
                            border: '1px solid rgba(74, 222, 128, 0.4)',
                            boxShadow: '0 4px 20px rgba(26, 92, 42, 0.4)',
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
                      label,
                      value,
                      unit,
                  }: {
    label: string
    value: string
    unit?: string
}) {
    return (
        <div
            className="px-3 py-2 rounded-lg"
            style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(42, 128, 64, 0.2)',
            }}
        >
            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#5a8060' }}>
                {label}
            </div>
            <div className="font-mono-nums text-sm font-semibold text-white truncate">
                {value}
                {unit && (
                    <span className="text-[10px] ml-1 font-normal" style={{ color: '#a8c4aa' }}>
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