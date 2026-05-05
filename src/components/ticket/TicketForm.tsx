import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Plus, Minus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'

import { api }              from '@/lib/axios'
import { useCreateTicket }  from '@/hooks/useTickets'
import { Button }           from '@/components/ui/Button'
import { useIsMobile }      from '@/hooks/useIsMobile'

import type {
    TicketCreatePayload, Operation, DeliveryMode,
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

const BILLS_BY_CURRENCY: Record<string, string[]> = {
    EUR: ['5', '10', '20', '50', '100', '200', '500'],
    USD: ['1', '2', '5', '10', '20', '50', '100'],
    GBP: ['5', '10', '20', '50'],
    CHF: ['10', '20', '50', '100', '200', '1000'],
    CAD: ['5', '10', '20', '50', '100'],
    AED: ['5', '10', '20', '50', '100', '200', '500', '1000'],
    SAR: ['1', '5', '10', '50', '100', '200', '500'],
    QAR: ['1', '5', '10', '50', '100', '500'],
    KWD: ['1/4', '1/2', '1', '5', '10', '20'],
    LYD: ['1', '5', '10', '20', '50'],
    JPY: ['1000', '2000', '5000', '10000'],
    BHD: ['1/2', '1', '5', '10', '20'],
}

const DELIVERY_MODES: { value: DeliveryMode; label: string }[] = [
    { value: 'CASH',      label: 'Espèces' },
    { value: 'ACCOUNT',   label: 'Virement compte' },
    { value: 'TRANSFER',  label: 'Virement externe' },
    { value: 'CHEQUE',    label: 'Chèque' },
    { value: 'BORDEREAU', label: 'Bordereau' },
]

const QUICK_VALIDITY = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 h',    value: 60 },
    { label: '2 h',    value: 120 },
    { label: '4 h',    value: 240 },
    { label: '8 h',    value: 480 },
    { label: '12 h',   value: 720 },
    { label: '24 h',   value: 1440 },
]

interface BillEntry {
    bill_value: string
    quantity:   number
}

export function TicketForm({ threadId, onClose }: Props) {
    const create   = useCreateTicket(threadId)
    const isMobile = useIsMobile()

    const [currencyId, setCurrencyId] = useState<number>(0)
    const [operation,  setOperation]  = useState<Operation>('BUY')
    const [amount,     setAmount]     = useState('')
    const [delivery,   setDelivery]   = useState<DeliveryMode>('CASH')
    const [branchCode, setBranchCode] = useState('')
    const [price,      setPrice]      = useState('')
    const [validity,   setValidity]   = useState<number>(30)
    const [comment,    setComment]    = useState('')
    const [bills,      setBills]      = useState<BillEntry[]>([])

    // ✅ Empêche le scroll du body en arrière-plan (essentiel mobile fullscreen)
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

    const showBillsSection = delivery === 'CASH' && operation === 'BUY'
    const availableBills = selectedCurrency ? BILLS_BY_CURRENCY[selectedCurrency.code] ?? [] : []

    const totalBillsValue = useMemo(() => {
        return bills.reduce((sum, b) => {
            const val = b.bill_value.includes('/')
                ? eval(b.bill_value)
                : parseFloat(b.bill_value)
            return sum + (val * b.quantity)
        }, 0)
    }, [bills])

    const amountNum = parseFloat(amount) || 0
    const hasBills = bills.length > 0
    const billsMatch = !showBillsSection || !hasBills || Math.abs(totalBillsValue - amountNum) < 0.001

    const tndEquivalent = useMemo(() => {
        const p = parseFloat(price)
        return amountNum && p ? (amountNum * p).toFixed(3) : '—'
    }, [amountNum, price])

    useEffect(() => {
        if (!showBillsSection) setBills([])
    }, [showBillsSection])

    const addBill = () => {
        if (availableBills.length === 0) return
        setBills([...bills, { bill_value: availableBills[0], quantity: 1 }])
    }
    const removeBill = (i: number) => setBills(bills.filter((_, idx) => idx !== i))
    const updateBill = (i: number, field: 'bill_value' | 'quantity', value: string | number) => {
        setBills(bills.map((b, idx) => idx === i ? { ...b, [field]: value } : b))
    }

    const canSubmit =
        currencyId > 0 &&
        amountNum > 0 &&
        parseFloat(price) > 0 &&
        branchCode !== '' &&
        validity > 0 &&
        billsMatch

    const handleSubmit = () => {
        if (!canSubmit) return
        const payload: TicketCreatePayload = {
            currency_id:      currencyId,
            operation,
            order_amount:     amountNum,
            delivery_mode:    delivery,
            branch_code:      branchCode,
            negotiated_price: parseFloat(price),
            validity_min:     validity,
            trader_comment:   comment || null,
            bills:            showBillsSection ? bills : [],
        }
        create.mutate(payload, { onSuccess: onClose })
    }

    /* ─── Conteneur : fullscreen mobile, modal centré desktop ─────── */
    const containerStyle: React.CSSProperties = isMobile
        ? {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'linear-gradient(180deg, #0f3a1a 0%, #0a1f0e 100%)',
            display: 'flex',
            flexDirection: 'column',
        }
        : {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(7, 13, 9, 0.75)',
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
            background: 'linear-gradient(180deg, #0f3a1a 0%, #0a1f0e 100%)',
            border: '1px solid rgba(42, 128, 64, 0.4)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
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

                {/* ─── HEADER (sticky en mobile) ─── */}
                <div
                    className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b flex-shrink-0"
                    style={{
                        background: isMobile ? 'rgba(15, 58, 26, 0.95)' : 'rgba(26, 92, 42, 0.3)',
                        borderColor: 'rgba(42, 128, 64, 0.3)',
                        // safe area iPhone notch
                        paddingTop: isMobile ? 'calc(0.875rem + env(safe-area-inset-top, 0))' : undefined,
                    }}
                >
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-base font-bold text-white">Nouveau ticket</h2>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: '#a8c4aa' }}>
                            Proposition de taux négocié
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                        style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.6)',
                        }}
                        aria-label="Fermer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ─── BODY (scrollable) ─── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

                    {/* OPÉRATION — Buy/Sell en cards radio */}
                    <Field label="Opération">
                        <div className="grid grid-cols-2 gap-2.5">
                            {(['BUY', 'SELL'] as Operation[]).map((op) => {
                                const isActive = operation === op
                                const isBuy = op === 'BUY'
                                const Icon = isBuy ? ArrowUpRight : ArrowDownRight
                                return (
                                    <button
                                        key={op}
                                        type="button"
                                        onClick={() => setOperation(op)}
                                        className="py-3.5 sm:py-3 rounded-xl text-sm font-semibold border transition-all active:scale-95 flex items-center justify-center gap-2"
                                        style={{
                                            background: isActive
                                                ? isBuy ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 113, 133, 0.2)'
                                                : 'rgba(0,0,0,0.2)',
                                            borderColor: isActive
                                                ? isBuy ? 'rgba(74, 222, 128, 0.5)' : 'rgba(251, 113, 133, 0.5)'
                                                : 'rgba(255,255,255,0.08)',
                                            color: isActive
                                                ? isBuy ? '#4ade80' : '#fb7185'
                                                : 'rgba(255,255,255,0.4)',
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

                    {/* MONTANT + TAUX — col-2 sur desktop, col-1 sur mobile */}
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
                                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.18), rgba(42, 128, 64, 0.1))',
                                border: '1px solid rgba(74, 222, 128, 0.35)',
                            }}
                        >
                            <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#a8c4aa' }}>
                                Équivalent TND
                            </div>
                            <div className="font-mono-nums text-2xl font-bold text-white mt-0.5">
                                {tndEquivalent} <span className="text-sm" style={{ color: '#a8c4aa' }}>TND</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Mode de livraison">
                            <Select value={delivery} onChange={(v) => setDelivery(v as DeliveryMode)}>
                                {DELIVERY_MODES.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </Select>
                        </Field>
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
                    </div>

                    {/* SECTION COUPURES — repensée mobile */}
                    {showBillsSection && (
                        <div
                            className="p-3 sm:p-3.5 rounded-xl space-y-2.5"
                            style={{
                                background: 'rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(42, 128, 64, 0.3)',
                            }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs sm:text-[12px] font-semibold text-white">
                                        Coupures {selectedCurrency?.code ?? ''}
                                        <span className="ml-1.5 text-[10px] font-normal" style={{ color: '#5a8060' }}>
                                            (optionnel)
                                        </span>
                                    </div>
                                    <div className="text-[10px] mt-0.5" style={{ color: '#5a8060' }}>
                                        Si ajoutées, total = montant
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addBill}
                                    disabled={availableBills.length === 0}
                                    className="px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all disabled:opacity-30 active:scale-95 flex-shrink-0"
                                    style={{
                                        background: 'rgba(74, 222, 128, 0.15)',
                                        border: '1px solid rgba(74, 222, 128, 0.3)',
                                        color: '#4ade80',
                                        minHeight: 40,
                                    }}
                                >
                                    <Plus size={13} /> Ajouter
                                </button>
                            </div>

                            {bills.length === 0 && (
                                <div className="text-center py-3 text-[11px]" style={{ color: '#5a8060' }}>
                                    Aucune coupure ajoutée
                                </div>
                            )}

                            <div className="space-y-2">
                                {bills.map((bill, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 p-2 rounded-lg"
                                        style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        <Select
                                            value={bill.bill_value}
                                            onChange={(v) => updateBill(i, 'bill_value', v)}
                                            className="flex-1 min-w-0"
                                        >
                                            {availableBills.map((b) => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </Select>

                                        <span className="text-sm font-bold flex-shrink-0" style={{ color: '#5a8060' }}>×</span>

                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => updateBill(i, 'quantity', Math.max(1, bill.quantity - 1))}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    color: 'rgba(255,255,255,0.6)',
                                                }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                inputMode="numeric"
                                                min={1}
                                                value={bill.quantity}
                                                onChange={(e) => updateBill(i, 'quantity', Math.max(1, Number(e.target.value)))}
                                                className="w-14 text-center px-1 py-1.5 rounded-lg font-mono-nums focus:outline-none"
                                                style={{
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    color: '#fff',
                                                    fontSize: '16px',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateBill(i, 'quantity', bill.quantity + 1)}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90"
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    color: 'rgba(255,255,255,0.6)',
                                                }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeBill(i)}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                                            style={{
                                                background: 'rgba(251, 113, 133, 0.1)',
                                                border: '1px solid rgba(251, 113, 133, 0.2)',
                                                color: '#fb7185',
                                            }}
                                            aria-label="Supprimer"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {bills.length > 0 && (
                                <div
                                    className="flex items-center justify-between pt-2.5 border-t"
                                    style={{ borderColor: 'rgba(42, 128, 64, 0.2)' }}
                                >
                                    <span className="text-[11px] font-semibold" style={{ color: '#a8c4aa' }}>
                                        Total coupures
                                    </span>
                                    <span
                                        className="font-mono-nums text-sm font-bold"
                                        style={{ color: Math.abs(totalBillsValue - amountNum) < 0.001 ? '#4ade80' : '#fb7185' }}
                                    >
                                        {totalBillsValue.toFixed(3)}
                                        {Math.abs(totalBillsValue - amountNum) >= 0.001 && ` ≠ ${amountNum.toFixed(3)}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <Field label="Validité du ticket">
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                            {QUICK_VALIDITY.map((opt) => {
                                const active = validity === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setValidity(opt.value)}
                                        className="py-2.5 sm:py-2 rounded-lg text-xs font-medium border transition-all active:scale-95"
                                        style={{
                                            background: active ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0,0,0,0.2)',
                                            borderColor: active ? 'rgba(74, 222, 128, 0.5)' : 'rgba(255,255,255,0.08)',
                                            color: active ? '#4ade80' : 'rgba(255,255,255,0.5)',
                                            minHeight: 40,
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] flex-shrink-0" style={{ color: '#5a8060' }}>ou minutes :</span>
                            <div className="flex-1 max-w-[180px]">
                                <NumberInput
                                    value={String(validity)}
                                    onChange={(v) => setValidity(Math.max(5, Math.min(1440, Number(v) || 5)))}
                                    step="5"
                                    min={5}
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
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fff',
                                fontSize: '16px',
                            }}
                        />
                    </Field>

                    {/* Padding bottom pour pas que le dernier élément soit caché par le footer sticky */}
                    {isMobile && <div style={{ height: 8 }} />}
                </div>

                {/* ─── FOOTER (sticky bottom mobile) ─── */}
                <div
                    className="flex gap-3 p-3 sm:p-4 border-t flex-shrink-0"
                    style={{
                        borderColor: 'rgba(42, 128, 64, 0.3)',
                        background: isMobile ? 'rgba(7, 13, 9, 0.98)' : 'rgba(0, 0, 0, 0.3)',
                        // safe area iPhone home bar
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

/* ═══ FIELD ═══════════════════════════════════════════════════════════ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1.5"
                   style={{ color: '#a8c4aa' }}>
                {label}
            </label>
            {children}
        </div>
    )
}

/* ═══ SELECT ═════════════════════════════════════════════════════════ */
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
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
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

/* ═══ NUMBER INPUT — avec inputMode pour clavier numérique mobile ═══ */
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
                    background: 'rgba(42, 128, 64, 0.15)',
                    border: '1px solid rgba(74, 222, 128, 0.25)',
                    color: '#4ade80',
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
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: '16px',
                    minHeight: 44,
                }}
            />
            <button
                type="button"
                onClick={() => onChange(String(current + stepNum))}
                className="w-10 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
                style={{
                    background: 'rgba(42, 128, 64, 0.15)',
                    border: '1px solid rgba(74, 222, 128, 0.25)',
                    color: '#4ade80',
                }}
            >
                <Plus size={14} />
            </button>
        </div>
    )
}