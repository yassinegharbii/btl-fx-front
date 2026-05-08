import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Plus, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

import { api }              from '@/lib/axios'
import { useCreateTicket }  from '@/hooks/useTickets'
import { Button }           from '@/components/ui/Button'
import { useIsMobile }      from '@/hooks/useIsMobile'

import type {
    TicketCreatePayload, Operation,
} from '@/types/ticket.types'

interface Props {
    threadId: number
    onClose:  () => void
}

const CURRENCIES_STATIC = [
    { currency_id: 1,  code: 'EUR', label: 'Euro' },
    { currency_id: 2,  code: 'USD', label: 'Dollar US' },
    { currency_id: 3,  code: 'GBP', label: 'Livre Sterling' },
    { currency_id: 4,  code: 'CHF', label: 'Franc Suisse' },
    { currency_id: 5,  code: 'CAD', label: 'Dollar Canadien' },
    { currency_id: 6,  code: 'AED', label: 'Dirham Émirien' },
    { currency_id: 7,  code: 'SAR', label: 'Riyal Saoudien' },
    { currency_id: 8,  code: 'QAR', label: 'Riyal Qatari' },
    { currency_id: 9,  code: 'KWD', label: 'Dinar Koweïtien' },
    { currency_id: 10, code: 'LYD', label: 'Dinar Libyen' },
    { currency_id: 11, code: 'JPY', label: 'Yen Japonais' },
    { currency_id: 12, code: 'BHD', label: 'Dinar Bahreïni' },
]

/* ─── Validité limitée : 15 min ou 30 min ─── */
const QUICK_VALIDITY = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
]

/* Limite max pour la saisie manuelle */
const VALIDITY_MIN = 5
const VALIDITY_MAX = 30

/* Mode de livraison forcé à CASH */
const DELIVERY_MODE_CASH = 'CASH' as const

export function TicketForm({ threadId, onClose }: Props) {
    const create   = useCreateTicket(threadId)
    const isMobile = useIsMobile()

    const [currencyId, setCurrencyId] = useState<number>(0)
    const [operation,  setOperation]  = useState<Operation>('BUY')
    const [amount,     setAmount]     = useState('')
    const [branchCode, setBranchCode] = useState('')
    const [price,      setPrice]      = useState('')
    const [validity,   setValidity]   = useState<number>(15)
    const [comment,    setComment]    = useState('')

    useEffect(() => {
        const original = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = original }
    }, [])

    const { data: branches } = useQuery({
        queryKey: ['branches', 'active'],
        queryFn:  () => api.get('/branch/active').then((r) => r.data),
        staleTime: Infinity,
    })

    const selectedCurrency = useMemo(
        () => CURRENCIES_STATIC.find((c) => c.currency_id === currencyId),
        [currencyId]
    )

    const amountNum = parseFloat(amount) || 0

    const tndEquivalent = useMemo(() => {
        const p = parseFloat(price)
        return amountNum && p ? (amountNum * p).toFixed(3) : '—'
    }, [amountNum, price])

    const canSubmit =
        currencyId > 0 &&
        amountNum > 0 &&
        parseFloat(price) > 0 &&
        branchCode !== '' &&
        validity >= VALIDITY_MIN &&
        validity <= VALIDITY_MAX

    const handleSubmit = () => {
        if (!canSubmit) return
        const payload: TicketCreatePayload = {
            currency_id:      currencyId,
            operation,
            order_amount:     amountNum,
            delivery_mode:    DELIVERY_MODE_CASH,  // ✅ Toujours CASH
            branch_code:      branchCode,
            negotiated_price: parseFloat(price),
            validity_min:     validity,
            trader_comment:   comment || null,
            bills:            [],                  // ✅ Toujours vide
        }
        create.mutate(payload, { onSuccess: onClose })
    }

    const containerStyle: React.CSSProperties = isMobile
        ? {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'var(--color-bg-elevated)',
            display: 'flex',
            flexDirection: 'column',
        }
        : {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'var(--color-bg-overlay)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
        }

    const cardStyle: React.CSSProperties = isMobile
        ? {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'transparent',
        }
        : {
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '1rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '92vh',
            width: '100%',
            maxWidth: '32rem',
        }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>

                {/* HEADER */}
                <div
                    className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b flex-shrink-0"
                    style={{
                        background: 'var(--color-bg-tertiary)',
                        borderColor: 'var(--color-border)',
                        paddingTop: isMobile ? 'calc(0.875rem + env(safe-area-inset-top, 0))' : undefined,
                    }}
                >
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold"
                            style={{ color: 'var(--color-text-primary)' }}>
                            Nouveau ticket
                        </h2>
                        <p className="text-[11px] mt-0.5 truncate"
                           style={{ color: 'var(--color-text-secondary)' }}>
                            Proposition de taux négocié
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-secondary)',
                        }}
                        aria-label="Fermer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

                    {/* OPÉRATION */}
                    <Field label="Opération">
                        <div className="grid grid-cols-2 gap-2.5">
                            {(['BUY', 'SELL'] as Operation[]).map((op) => {
                                const isActive = operation === op
                                const isBuy = op === 'BUY'
                                const Icon = isBuy ? ArrowUpRight : ArrowDownRight
                                const semantic = isBuy ? 'success' : 'danger'

                                return (
                                    <button
                                        key={op}
                                        type="button"
                                        onClick={() => setOperation(op)}
                                        className="py-3.5 sm:py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95 flex items-center justify-center gap-2"
                                        style={{
                                            background: isActive
                                                ? `var(--color-${semantic}-bg)`
                                                : 'var(--color-bg-input)',
                                            borderColor: isActive
                                                ? `var(--color-${semantic}-border)`
                                                : 'var(--color-border-subtle)',
                                            color: isActive
                                                ? `var(--color-${semantic})`
                                                : 'var(--color-text-tertiary)',
                                            minHeight: 48,
                                        }}
                                    >
                                        <Icon size={16} />
                                        {op === 'BUY' ? 'Achat' : 'Vente'}
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    <Field label="Devise">
                        <Select value={String(currencyId)} onChange={(v) => setCurrencyId(Number(v))}>
                            <option value="0">— Sélectionner —</option>
                            {CURRENCIES_STATIC.map((c) => (
                                <option key={c.currency_id} value={c.currency_id}>
                                    {c.code} — {c.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {/* MONTANT + TAUX */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label={`Montant ${selectedCurrency?.code ?? ''}`}>
                            <NumberInput
                                value={amount}
                                onChange={setAmount}
                                placeholder="5000"
                                step="1"
                                min={0}
                                inputMode="decimal"
                            />
                        </Field>
                        <Field label="Taux négocié (TND)">
                            <NumberInput
                                value={price}
                                onChange={setPrice}
                                placeholder="3.3790"
                                step="0.0001"
                                min={0}
                                inputMode="decimal"
                            />
                        </Field>
                    </div>

                    {amountNum > 0 && parseFloat(price) > 0 && (
                        <div
                            className="px-3 py-3 rounded-xl text-center"
                            style={{
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-border)',
                            }}
                        >
                            <div className="text-[10px] uppercase tracking-widest font-semibold"
                                 style={{ color: 'var(--color-text-secondary)' }}>
                                Équivalent TND
                            </div>
                            <div className="font-mono-nums text-2xl font-bold mt-0.5"
                                 style={{ color: 'var(--color-text-primary)' }}>
                                {tndEquivalent}
                                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {' '}TND
                                </span>
                            </div>
                        </div>
                    )}

                    {/* AGENCE — seul champ restant (mode livraison enlevé) */}
                    <Field label="Agence">
                        <Select value={branchCode} onChange={setBranchCode}>
                            <option value="">— Sélectionner —</option>
                            {branches?.map((b: any) => (
                                <option key={b.branch_code} value={b.branch_code}>
                                    {b.branch_code} — {b.branch_name}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    {/* VALIDITÉ — 15 ou 30 min uniquement, manuel max 30 min */}
                    <Field label="Validité du ticket">
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
                                            background: active
                                                ? 'var(--color-success-bg)'
                                                : 'var(--color-bg-input)',
                                            borderColor: active
                                                ? 'var(--color-success-border)'
                                                : 'var(--color-border-subtle)',
                                            color: active
                                                ? 'var(--color-success)'
                                                : 'var(--color-text-tertiary)',
                                            minHeight: 44,
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] flex-shrink-0"
                                  style={{ color: 'var(--color-text-tertiary)' }}>
                                ou minutes (max {VALIDITY_MAX}) :
                            </span>
                            <div className="flex-1 max-w-[180px]">
                                <NumberInput
                                    value={String(validity)}
                                    onChange={(v) => {
                                        const num = Number(v) || VALIDITY_MIN
                                        // clamp dans [5, 30]
                                        setValidity(Math.max(VALIDITY_MIN, Math.min(VALIDITY_MAX, num)))
                                    }}
                                    step="5"
                                    min={VALIDITY_MIN}
                                    inputMode="numeric"
                                />
                            </div>
                        </div>
                    </Field>

                    <Field label="Commentaire (optionnel)">
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Message pour le client..."
                            className="w-full px-3 py-2.5 rounded-xl resize-none focus:outline-none transition-colors"
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border-subtle)',
                                color: 'var(--color-text-primary)',
                                fontSize: '16px',
                            }}
                        />
                    </Field>

                    {isMobile && <div style={{ height: 8 }} />}
                </div>

                {/* FOOTER */}
                <div
                    className="flex gap-3 p-3 sm:p-4 border-t flex-shrink-0"
                    style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-tertiary)',
                        paddingBottom: isMobile ? 'calc(0.75rem + env(safe-area-inset-bottom, 0))' : undefined,
                    }}
                >
                    <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={onClose}
                        style={{ minHeight: 48 }}
                    >
                        Annuler
                    </Button>
                    <Button
                        className="flex-[2]"
                        loading={create.isPending}
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        style={{ minHeight: 48 }}
                    >
                        Proposer le ticket
                    </Button>
                </div>
            </div>
        </div>
    )
}

/* ─── FIELD ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1.5"
                   style={{ color: 'var(--color-text-secondary)' }}>
                {label}
            </label>
            {children}
        </div>
    )
}

/* ─── SELECT ─── */
function Select({
                    value, onChange, children, className,
                }: {
    value: string
    onChange: (v: string) => void
    children: React.ReactNode
    className?: string
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl focus:outline-none transition-colors cursor-pointer ${className ?? ''}`}
            style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a8c4aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '14px',
                paddingRight: '32px',
                fontSize: '16px',
                minHeight: 44,
            }}
        >
            {children}
        </select>
    )
}

/* ─── NUMBER INPUT ─── */
function NumberInput({
                         value, onChange, placeholder, step = '1', min, inputMode,
                     }: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    step?: string
    min?: number
    inputMode?: 'numeric' | 'decimal'
}) {
    const stepNum = parseFloat(step) || 1
    const current = parseFloat(value) || 0

    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={() => {
                    const next = Math.max(min ?? -Infinity, current - stepNum)
                    onChange(String(next))
                }}
                className="w-10 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                    color: 'var(--color-success)',
                }}
            >
                <Minus size={14} />
            </button>
            <input
                type="number"
                inputMode={inputMode ?? 'decimal'}
                step={step}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                className="flex-1 min-w-0 px-3 py-2.5 text-center font-mono-nums rounded-xl focus:outline-none transition-colors"
                style={{
                    background: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '16px',
                    minHeight: 44,
                }}
            />
            <button
                type="button"
                onClick={() => onChange(String(current + stepNum))}
                className="w-10 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                    color: 'var(--color-success)',
                }}
            >
                <Plus size={14} />
            </button>
        </div>
    )
}