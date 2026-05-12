import { useState } from 'react'
import { X, Check, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

import {
    useTraderAcceptClientTicket,
    useTraderDeclineClientTicket,
    useTraderCounterTicket,
} from '@/hooks/useTickets'

import { TicketBadge } from './TicketBadge'
import type { Ticket } from '@/types/ticket.types'

interface Props {
    ticket: Ticket
}

type View = 'main' | 'accept' | 'counter'

export function TraderTicketPopup({ ticket }: Props) {
    const [view, setView] = useState<View>('main')

    const acceptMut  = useTraderAcceptClientTicket()
    const declineMut = useTraderDeclineClientTicket()
    const counterMut = useTraderCounterTicket()

    const isPending = acceptMut.isPending || declineMut.isPending || counterMut.isPending

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
                    boxShadow: 'inset 0 0 120px var(--color-warning-bg)',
                    animation: 'alertPulse 2s ease-in-out infinite',
                }}
            />

            <div
                className="relative w-full sm:max-w-md sm:rounded-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh]"
                style={{
                    background: 'var(--color-bg-elevated)',
                    border: '2px solid var(--color-warning-border)',
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
                    {view !== 'main' && (
                        <button
                            onClick={() => setView('main')}
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border-subtle)',
                                color: 'var(--color-text-secondary)',
                            }}
                            disabled={isPending}
                        >
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'var(--color-warning-bg)',
                            border: '1px solid var(--color-warning-border)',
                        }}
                    >
                        <AlertCircle size={18} style={{ color: 'var(--color-warning)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm sm:text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {view === 'main'    && 'Demande de taux'}
                            {view === 'accept'  && 'Accepter — Définir validité'}
                            {view === 'counter' && 'Contre-proposition'}
                        </h2>
                        <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                            {view === 'main'    && 'Votre client propose une transaction'}
                            {view === 'accept'  && 'Saisissez la validité du ticket'}
                            {view === 'counter' && 'Modifiez le taux et la validité'}
                        </p>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">

                    {view === 'main' && <TicketRecap ticket={ticket} />}

                    {view === 'accept' && (
                        <AcceptForm
                            ticket={ticket}
                            onSubmit={(payload) =>
                                acceptMut.mutate(
                                    { orderId: ticket.order_id, payload },
                                    { onSuccess: () => setView('main') }
                                )
                            }
                            isPending={acceptMut.isPending}
                        />
                    )}

                    {view === 'counter' && (
                        <CounterForm
                            ticket={ticket}
                            onSubmit={(payload) =>
                                counterMut.mutate(
                                    { orderId: ticket.order_id, payload },
                                    { onSuccess: () => setView('main') }
                                )
                            }
                            isPending={counterMut.isPending}
                        />
                    )}
                </div>

                {/* FOOTER : 3 boutons seulement en vue main */}
                {view === 'main' && (
                    <div
                        className="p-3 sm:p-4 grid grid-cols-3 gap-2 border-t flex-shrink-0"
                        style={{
                            borderColor: 'var(--color-border)',
                            background: 'var(--color-bg-tertiary)',
                        }}
                    >
                        <button
                            disabled={isPending}
                            onClick={() => declineMut.mutate(ticket.order_id)}
                            className="py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 min-h-[48px]"
                            style={{
                                background: 'var(--color-danger-bg)',
                                border: '1px solid var(--color-danger-border)',
                                color: 'var(--color-danger)',
                            }}
                        >
                            <X size={14} />
                            Refuser
                        </button>
                        <button
                            disabled={isPending}
                            onClick={() => setView('counter')}
                            className="py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 min-h-[48px]"
                            style={{
                                background: 'var(--color-info-bg)',
                                border: '1px solid var(--color-info-border)',
                                color: 'var(--color-info)',
                            }}
                        >
                            <RefreshCw size={14} />
                            Contrer
                        </button>
                        <button
                            disabled={isPending}
                            onClick={() => setView('accept')}
                            className="py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 text-white min-h-[48px]"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))',
                                border: '1px solid var(--color-success-border)',
                                boxShadow: 'var(--shadow-glow)',
                            }}
                        >
                            <Check size={14} />
                            Accepter
                        </button>
                    </div>
                )}
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

/* ─── Double export pour sécuriser l'import (named + default) ─── */
export default TraderTicketPopup

/* ───────────────────────────────────────────────────────────────────── */
/*                     SOUS-VUE : RÉCAP DU TICKET                        */
/* ───────────────────────────────────────────────────────────────────── */

function TicketRecap({ ticket }: { ticket: Ticket }) {
    return (
        <>
            <div className="flex items-center justify-between">
                <span className="font-mono-nums text-sm font-bold tracking-wide"
                      style={{ color: 'var(--color-text-primary)' }}>
                    {ticket.ref_ticket}
                </span>
                <TicketBadge status={ticket.order_status} />
            </div>

            <div
                className="text-center py-3 rounded-xl"
                style={{
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest mb-1"
                     style={{ color: 'var(--color-text-tertiary)' }}>
                    Opération
                </div>
                <div className="text-lg sm:text-xl font-bold"
                     style={{ color: ticket.operation === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {ticket.operation === 'BUY' ? '▲ Achat' : '▼ Vente'} {ticket.currency_code}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <InfoCard
                    label="Montant"
                    value={ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                    unit={ticket.currency_code ?? ''}
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
                <InfoCard
                    label="Taux marché"
                    value={ticket.market_rate_used?.toFixed(4) ?? '—'}
                />
            </div>

            <div
                className="text-center py-3 sm:py-4 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, var(--color-warning-bg), var(--color-bg-tertiary))',
                    border: '1px solid var(--color-warning-border)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest mb-1"
                     style={{ color: 'var(--color-text-secondary)' }}>
                    Taux proposé par le client
                </div>
                <div className="font-mono-nums text-2xl sm:text-3xl font-bold"
                     style={{ color: 'var(--color-text-primary)' }}>
                    {ticket.negotiated_price?.toFixed(4)}
                </div>
            </div>

            {ticket.client_comment && (
                <div
                    className="px-3 py-2 rounded-lg italic text-xs"
                    style={{
                        background: 'var(--color-info-bg)',
                        borderLeft: '2px solid var(--color-info)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    « {ticket.client_comment} »
                </div>
            )}
        </>
    )
}

/* ───────────────────────────────────────────────────────────────────── */
/*                  SOUS-VUE : FORMULAIRE ACCEPTER                       */
/* ───────────────────────────────────────────────────────────────────── */

const QUICK_VALIDITY = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
]

function AcceptForm({
                        ticket,
                        onSubmit,
                        isPending,
                    }: {
    ticket: Ticket
    onSubmit: (payload: { validity_min: number; trader_comment: string | null }) => void
    isPending: boolean
}) {
    const [validity, setValidity] = useState(15)
    const [comment,  setComment]  = useState('')

    return (
        <>
            <div
                className="px-3 py-3 rounded-xl text-center"
                style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                }}
            >
                <div className="text-[10px] uppercase tracking-widest mb-1"
                     style={{ color: 'var(--color-text-secondary)' }}>
                    Vous acceptez ce taux
                </div>
                <div className="font-mono-nums text-2xl font-bold"
                     style={{ color: 'var(--color-text-primary)' }}>
                    {ticket.negotiated_price?.toFixed(4)} TND
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {ticket.operation === 'BUY' ? 'Achat' : 'Vente'} {ticket.currency_code} ·
                    {' '}{ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                    Validité du ticket
                </label>

                <div className="grid grid-cols-2 gap-2">
                    {QUICK_VALIDITY.map((opt) => {
                        const active = validity === opt.value
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setValidity(opt.value)}
                                className="py-3 rounded-lg text-sm font-medium border transition-all active:scale-95"
                                style={{
                                    background: active ? 'var(--color-success-bg)' : 'var(--color-bg-input)',
                                    borderColor: active ? 'var(--color-success-border)' : 'var(--color-border-subtle)',
                                    color: active ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                                    minHeight: 44,
                                }}
                            >
                                {opt.label}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                        ou minutes (5-30) :
                    </span>
                    <input
                        type="number"
                        min={5}
                        max={30}
                        step="5"
                        value={validity}
                        onChange={(e) => {
                            const v = Number(e.target.value) || 5
                            setValidity(Math.max(5, Math.min(30, v)))
                        }}
                        className="w-20 px-3 py-2 text-center font-mono-nums rounded-lg focus:outline-none"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-primary)',
                            fontSize: '16px',
                        }}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                    Commentaire (optionnel)
                </label>
                <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Message pour le client..."
                    className="w-full px-3 py-2.5 rounded-xl resize-none focus:outline-none"
                    style={{
                        background: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '16px',
                    }}
                />
            </div>

            <button
                onClick={() => onSubmit({ validity_min: validity, trader_comment: comment || null })}
                disabled={isPending || validity < 5 || validity > 30}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white min-h-[48px] disabled:opacity-40"
                style={{
                    background: 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))',
                    border: '1px solid var(--color-success-border)',
                    boxShadow: 'var(--shadow-glow)',
                }}
            >
                <Check size={16} />
                {isPending ? 'Acceptation...' : "Confirmer l'acceptation"}
            </button>
        </>
    )
}

/* ───────────────────────────────────────────────────────────────────── */
/*                  SOUS-VUE : FORMULAIRE CONTRER                        */
/* ───────────────────────────────────────────────────────────────────── */

function CounterForm({
                         ticket,
                         onSubmit,
                         isPending,
                     }: {
    ticket: Ticket
    onSubmit: (payload: { negotiated_price: number; validity_min: number; trader_comment: string | null }) => void
    isPending: boolean
}) {
    /* ✅ Initialisation directe via useState (pas useEffect)
       Pas de problème setState-in-effect car c'est l'init initial */
    const [price,    setPrice]    = useState(String(ticket.negotiated_price ?? ''))
    const [validity, setValidity] = useState(15)
    const [comment,  setComment]  = useState('')

    const priceNum = parseFloat(price) || 0
    const canSubmit = priceNum > 0 && validity >= 5 && validity <= 30

    const newTnd = priceNum * ticket.order_amount

    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)' }}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                        Demande client
                    </div>
                    <div className="font-mono-nums text-sm font-bold" style={{ color: 'var(--color-warning)' }}>
                        {ticket.negotiated_price?.toFixed(4)}
                    </div>
                </div>
                <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Votre contre
                    </div>
                    <div className="font-mono-nums text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                        {priceNum > 0 ? priceNum.toFixed(4) : '—'}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                    Nouveau taux proposé (TND)
                </label>
                <input
                    type="number"
                    step="0.0001"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3.3850"
                    className="w-full px-3 py-3 text-center font-mono-nums rounded-xl focus:outline-none"
                    style={{
                        background: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '20px',
                        fontWeight: 700,
                        minHeight: 52,
                    }}
                    inputMode="decimal"
                    autoFocus
                />
                {priceNum > 0 && (
                    <div className="text-[11px] mt-1 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                        Équivalent : {newTnd.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
                    </div>
                )}
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                    Validité
                </label>

                <div className="grid grid-cols-2 gap-2">
                    {QUICK_VALIDITY.map((opt) => {
                        const active = validity === opt.value
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setValidity(opt.value)}
                                className="py-3 rounded-lg text-sm font-medium border transition-all active:scale-95"
                                style={{
                                    background: active ? 'var(--color-success-bg)' : 'var(--color-bg-input)',
                                    borderColor: active ? 'var(--color-success-border)' : 'var(--color-border-subtle)',
                                    color: active ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                                    minHeight: 44,
                                }}
                            >
                                {opt.label}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                        ou minutes (5-30) :
                    </span>
                    <input
                        type="number"
                        min={5}
                        max={30}
                        step="5"
                        value={validity}
                        onChange={(e) => {
                            const v = Number(e.target.value) || 5
                            setValidity(Math.max(5, Math.min(30, v)))
                        }}
                        className="w-20 px-3 py-2 text-center font-mono-nums rounded-lg focus:outline-none"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-primary)',
                            fontSize: '16px',
                        }}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold mb-2"
                       style={{ color: 'var(--color-text-secondary)' }}>
                    Commentaire (optionnel)
                </label>
                <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Justifiez votre contre-proposition..."
                    className="w-full px-3 py-2.5 rounded-xl resize-none focus:outline-none"
                    style={{
                        background: 'var(--color-bg-input)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-primary)',
                        fontSize: '16px',
                    }}
                />
            </div>

            <button
                onClick={() =>
                    onSubmit({
                        negotiated_price: priceNum,
                        validity_min: validity,
                        trader_comment: comment || null,
                    })
                }
                disabled={isPending || !canSubmit}
                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white min-h-[48px] disabled:opacity-40"
                style={{
                    background: 'linear-gradient(135deg, var(--color-info), #2563eb)',
                    border: '1px solid var(--color-info-border)',
                }}
            >
                <RefreshCw size={16} />
                {isPending ? 'Envoi...' : 'Envoyer la contre-proposition'}
            </button>
        </>
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