import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ArrowDownRight, Plus, Minus, Info } from 'lucide-react'

import { api }                   from '@/lib/axios'
import { useClientCreateTicket } from '@/hooks/useTickets'
import { useTraderRates }        from '@/hooks/useTraderRates'
import { Button }                from '@/components/ui/Button'
import { useIsMobile }           from '@/hooks/useIsMobile'

import type {
    TicketCreateByClientPayload,
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

export function ClientTicketForm({ threadId, onClose }: Props) {
    const create   = useClientCreateTicket(threadId)
    const isMobile = useIsMobile()

    const { data: ratesData } = useTraderRates()

    const [currencyId, setCurrencyId] = useState<number>(0)
    const [amount,     setAmount]     = useState('')
    const [branchCode, setBranchCode] = useState('')
    const [comment,    setComment]    = useState('')

    const [userPrice, setUserPrice] = useState<string | null>(null)

    /* ✅ Le client veut VENDRE des devises (perspective client).
       En BDD ça correspond à BUY (le trader achète au client).
       Convention bancaire : la BDD stocke toujours la perspective trader. */
    const OPERATION_FOR_BACKEND = 'BUY' as const

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

    /* ─── Taux suggéré : le client veut vendre, donc utiliser le BUY trader
           (prix auquel le trader achète) ─── */
    const suggestedPrice = useMemo<string>(() => {
        if (!selectedCurrency || !ratesData) return ''

        const rate = ratesData.rates.find((r) => r.code === selectedCurrency.code)
        if (!rate) return ''

        return String(rate.buy)
    }, [selectedCurrency, ratesData])

    const price = userPrice ?? suggestedPrice
    const priceTouched = userPrice !== null

    const amountNum = parseFloat(amount) || 0

    const tndEquivalent = useMemo(() => {
        const p = parseFloat(price)
        return amountNum && p ? (amountNum * p).toFixed(3) : '—'
    }, [amountNum, price])

    const canSubmit =
        currencyId > 0 &&
        amountNum > 0 &&
        parseFloat(price) > 0 &&
        branchCode !== ''

    const handleSubmit = () => {
        if (!canSubmit) return
        const payload: TicketCreateByClientPayload = {
            currency_id:      currencyId,
            operation:        OPERATION_FOR_BACKEND,  // ✅ envoie BUY (perspective trader)
            order_amount:     amountNum,
            branch_code:      branchCode,
            negotiated_price: parseFloat(price),
            client_comment:   comment || null,
        }
        create.mutate(payload, { onSuccess: onClose })
    }

    const handleCurrencyChange = (newId: number) => {
        setCurrencyId(newId)
        setUserPrice(null)
    }

    const containerStyle: React.CSSProperties = isMobile
        ? {
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'var(--color-bg-elevated)',
            display: 'flex', flexDirection: 'column',
        }
        : {
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'var(--color-bg-overlay)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }

    const cardStyle: React.CSSProperties = isMobile
        ? {
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'transparent',
        }
        : {
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-strong)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: '1rem', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            maxHeight: '92vh', width: '100%', maxWidth: '32rem',
        }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>

                <div
                    className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b flex-shrink-0"
                    style={{
                        background: 'var(--color-bg-tertiary)',
                        borderColor: 'var(--color-border)',
                        paddingTop: isMobile ? 'calc(0.875rem + env(safe-area-inset-top, 0))' : undefined,
                    }}
                >
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            Vendre des devises
                        </h2>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                            Votre trader vous répondra rapidement
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

                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1.5"
                               style={{ color: 'var(--color-text-secondary)' }}>
                            Opération
                        </label>
                        <div
                            className="py-3.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2"
                            style={{
                                background: 'var(--color-danger-bg)',
                                borderColor: 'var(--color-danger-border)',
                                color: 'var(--color-danger)',
                                minHeight: 48,
                            }}
                        >
                            <ArrowDownRight size={16} />
                            Vente de devises
                        </div>
                    </div>

                    <div
                        className="px-3 py-2.5 rounded-xl text-[11px] flex items-start gap-2"
                        style={{
                            background: 'var(--color-info-bg)',
                            border: '1px solid var(--color-info-border)',
                            color: 'var(--color-info)',
                        }}
                    >
                        <Info size={14} className="flex-shrink-0 mt-0.5" />
                        <span>
                            <strong>Pour acheter des devises :</strong> contactez directement votre trader
                            via la messagerie. Il étudiera votre demande et reviendra vers vous avec une proposition adaptée.
                        </span>
                    </div>

                    <Field label="Devise à vendre">
                        <Select value={String(currencyId)} onChange={(v) => handleCurrencyChange(Number(v))}>
                            <option value="0">— Sélectionner —</option>
                            {CURRENCIES_STATIC.map((c) => (
                                <option key={c.currency_id} value={c.currency_id}>
                                    {c.code} — {c.label}
                                </option>
                            ))}
                        </Select>
                    </Field>

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
                        <Field label="Taux proposé (TND)">
                            <NumberInput
                                value={price}
                                onChange={(v) => setUserPrice(v)}
                                placeholder="3.3790"
                                step="0.0001"
                                min={0}
                                inputMode="decimal"
                            />
                            {selectedCurrency && suggestedPrice && (
                                <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                                    {priceTouched
                                        ? `✏️ Taux modifié (taux trader: ${suggestedPrice})`
                                        : '✓ Taux trader actuel (modifiable)'}
                                </div>
                            )}
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
                                Vous recevrez
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

                    <Field label="Agence">
                        <Select value={branchCode} onChange={setBranchCode}>
                            <option value="">— Sélectionner —</option>
                            {branches?.map((b: { branch_code: string; branch_name: string }) => (
                                <option key={b.branch_code} value={b.branch_code}>
                                    {b.branch_code} — {b.branch_name}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <div
                        className="px-3 py-2 rounded-xl text-[11px] flex items-start gap-2"
                        style={{
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        <span className="text-sm">ℹ️</span>
                        <span>
                            Le trader définira la durée de validité du ticket lors de son acceptation
                            ou de sa contre-proposition.
                        </span>
                    </div>

                    <Field label="Commentaire (optionnel)">
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Précisez votre demande..."
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

                <div
                    className="flex gap-3 p-3 sm:p-4 border-t flex-shrink-0"
                    style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-tertiary)',
                        paddingBottom: isMobile ? 'calc(0.75rem + env(safe-area-inset-bottom, 0))' : undefined,
                    }}
                >
                    <Button variant="ghost" className="flex-1" onClick={onClose} style={{ minHeight: 48 }}>
                        Annuler
                    </Button>
                    <Button
                        className="flex-[2]"
                        loading={create.isPending}
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        style={{ minHeight: 48 }}
                    >
                        Envoyer la proposition
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ClientTicketForm

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