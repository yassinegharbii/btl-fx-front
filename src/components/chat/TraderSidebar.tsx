import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TrendingUp, Users, Search, X, Edit2, Check } from 'lucide-react'

import { useAllThreads }      from '@/hooks/useThread'
import { useAllClients }      from '@/hooks/useUsers'
import { useTraderRates, useUpdateTraderRate } from '@/hooks/useTraderRates'
import { ThreadItem }         from './ThreadItem'
import { Spinner }            from '@/components/ui/Spinner'
import type { TraderRate }    from '@/types/traderRate.types'

function FlagImg({ code, emoji }: { code: string; emoji: string | null }) {
    const [err, setErr] = useState(false)
    if (err) return <span className="text-base">{emoji ?? code}</span>
    return (
        <img
            src={`/flags/${code}.png`}
            alt={code}
            onError={() => setErr(true)}
            className="w-9 h-6 object-cover rounded-sm"
        />
    )
}

function pad(n: number) { return String(n).padStart(2, '0') }

function useLiveTime() {
    const [time, setTime] = useState('')
    useEffect(() => {
        const tick = () => {
            const n = new Date()
            setTime(`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])
    return time
}

export function TraderSidebar() {
    const { data: ratesData, isLoading: ratesLoading } = useTraderRates()
    const liveTime = useLiveTime()

    const { data: threads, isLoading: threadsLoading } = useAllThreads()
    const { data: clients } = useAllClients()
    const { threadId } = useParams()
    const navigate = useNavigate()

    const [search, setSearch] = useState('')

    const clientById = useMemo(() => {
        const map: Record<number, { full_name: string | null; username: string }> = {}
        ;(clients ?? []).forEach((c: any) => {
            map[c.user_id] = {
                full_name: c.full_name,
                username:  c.username,
            }
        })
        return map
    }, [clients])

    const filteredThreads = useMemo(() => {
        if (!threads) return []
        if (!search.trim()) return threads

        const q = search.toLowerCase().trim()
        return threads.filter((t: any) => {
            const client = clientById[t.client_id]
            if (!client) return false

            const username = client.username?.toLowerCase() ?? ''
            const fullName = client.full_name?.toLowerCase() ?? ''
            return username.includes(q) || fullName.includes(q)
        })
    }, [threads, search, clientById])

    return (
        <div className="flex flex-col h-full overflow-hidden"
             style={{
                 background: 'var(--color-bg-secondary)',
                 borderRight: '1px solid var(--color-border)',
             }}>

            {/* SECTION TAUX */}
            <div className="flex-shrink-0 max-h-[45%] flex flex-col"
                 style={{ borderBottom: '1px solid var(--color-divider)' }}>

                <div className="px-4 py-3 flex-shrink-0"
                     style={{
                         background: 'var(--color-bg-tertiary)',
                         borderBottom: '1px solid var(--color-border-subtle)',
                     }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={13} style={{ color: 'var(--color-success)' }} />
                            <span className="text-[11px] font-bold uppercase tracking-widest"
                                  style={{ color: 'var(--color-text-secondary)' }}>
                                Taux salle
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full inline-block"
                                  style={{ background: 'var(--color-success)', animation: 'pulseDot 1.5s infinite' }} />
                            <span className="text-[10px] uppercase tracking-widest"
                                  style={{ color: 'var(--color-text-tertiary)' }}>
                                Live
                            </span>
                        </div>
                    </div>
                    <div className="text-[11px] font-mono-nums mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {liveTime}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {ratesLoading && (
                        <div className="p-4 text-center text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                            Chargement...
                        </div>
                    )}
                    {ratesData?.rates.map((rate, i) => (
                        <EditableRateRow key={rate.code} rate={rate} index={i} />
                    ))}
                </div>
            </div>

            {/* SÉPARATEUR + COMPTEUR */}
            <div className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2"
                 style={{
                     background: 'var(--color-bg-tertiary)',
                     borderTop: '1px solid var(--color-border)',
                     borderBottom: '1px solid var(--color-border-subtle)',
                 }}>
                <Users size={12} style={{ color: 'var(--color-success)' }} />
                <span className="text-[11px] font-bold uppercase tracking-widest flex-1"
                      style={{ color: 'var(--color-text-secondary)' }}>
                    Clients actifs
                </span>
                <span className="text-[11px] font-mono-nums px-2 py-0.5 rounded font-bold"
                      style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                    {filteredThreads.length}{threads && filteredThreads.length !== threads.length ? `/${threads.length}` : ''}
                </span>
            </div>

            {/* BARRE DE RECHERCHE */}
            <div className="flex-shrink-0 px-3 py-2.5"
                 style={{
                     background: 'var(--color-bg-tertiary)',
                     borderBottom: '1px solid var(--color-border-subtle)',
                 }}>
                <div className="relative">
                    <Search size={12}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un client..."
                        className="w-full pl-8 pr-8 py-2 text-[12px] rounded-md focus:outline-none transition-colors"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-primary)',
                            fontSize: '14px',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-success-border)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center"
                            style={{ color: 'var(--color-text-tertiary)' }}
                            title="Effacer"
                        >
                            <X size={11} />
                        </button>
                    )}
                </div>
            </div>

            {/* SECTION CLIENTS */}
            <div className="flex-1 overflow-y-auto">
                {threadsLoading && (
                    <div className="flex justify-center py-6"><Spinner /></div>
                )}

                {!threadsLoading && filteredThreads.map((thread) => (
                    <ThreadItem
                        key={thread.thread_id}
                        thread={thread}
                        active={String(thread.thread_id) === threadId}
                        onClick={() => navigate(`/trader/${thread.thread_id}`)}
                    />
                ))}

                {!threadsLoading && threads && threads.length > 0 && filteredThreads.length === 0 && (
                    <div className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        Aucun client ne correspond à<br />
                        <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>« {search} »</span>
                    </div>
                )}

                {!threadsLoading && !threads?.length && (
                    <div className="px-4 py-6 text-center text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        Aucune discussion active
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────── */
/*       LIGNE DE TAUX ÉDITABLE — uniquement côté trader                   */
/* ─────────────────────────────────────────────────────────────────────── */

function EditableRateRow({ rate, index }: { rate: TraderRate; index: number }) {
    const [editing, setEditing] = useState(false)
    const [buy, setBuy]   = useState(String(rate.buy))
    const [sell, setSell] = useState(String(rate.sell))

    const update = useUpdateTraderRate()

    /* Garde les inputs en sync si le taux change depuis le WS */
    useEffect(() => {
        if (!editing) {
            setBuy(String(rate.buy))
            setSell(String(rate.sell))
        }
    }, [rate.buy, rate.sell, editing])

    const handleSave = () => {
        const buyNum = parseFloat(buy)
        const sellNum = parseFloat(sell)

        if (isNaN(buyNum) || isNaN(sellNum) || buyNum <= 0 || sellNum <= 0) {
            return
        }
        if (sellNum <= buyNum) {
            return
        }

        update.mutate(
            { code: rate.code, payload: { buy: buyNum, sell: sellNum } },
            {
                onSuccess: () => setEditing(false),
            }
        )
    }

    const handleCancel = () => {
        setEditing(false)
        setBuy(String(rate.buy))
        setSell(String(rate.sell))
    }

    const buyNum  = parseFloat(buy)  || 0
    const sellNum = parseFloat(sell) || 0
    const isInvalid = editing && (sellNum <= buyNum || buyNum <= 0)

    return (
        <div
            className="flex items-center px-3 py-2 transition-colors group"
            style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                background: editing
                    ? 'var(--color-success-bg)'
                    : index % 2 !== 0
                        ? 'var(--color-bg-tertiary)'
                        : 'transparent',
            }}
        >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex-shrink-0 w-9 h-6 rounded overflow-hidden border flex items-center justify-center"
                     style={{
                         background: 'var(--color-bg-input)',
                         borderColor: 'var(--color-border-subtle)',
                     }}>
                    <FlagImg code={rate.code} emoji={rate.flag} />
                </div>
                <span className="text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {rate.code}
                </span>
            </div>

            {!editing ? (
                <>
                    <div className="flex items-center gap-2">
                        <span className="w-12 text-right font-mono-nums text-[12px] font-bold"
                              style={{ color: 'var(--color-success)' }}>
                            {Number(rate.buy).toFixed(3)}
                        </span>
                        <span className="w-12 text-right font-mono-nums text-[12px] font-bold"
                              style={{ color: 'var(--color-danger)' }}>
                            {Number(rate.sell).toFixed(3)}
                        </span>
                    </div>
                    <button
                        onClick={() => setEditing(true)}
                        title="Modifier"
                        className="ml-1.5 w-6 h-6 rounded flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                        style={{
                            background: 'var(--color-warning-bg)',
                            border: '1px solid var(--color-warning-border)',
                            color: 'var(--color-warning)',
                        }}
                    >
                        <Edit2 size={10} />
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        step="0.0001"
                        value={buy}
                        onChange={(e) => setBuy(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave()
                            if (e.key === 'Escape') handleCancel()
                        }}
                        autoFocus
                        className="w-14 text-right px-1 py-0.5 font-mono-nums text-[11px] font-bold rounded focus:outline-none"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: `1px solid ${isInvalid ? 'var(--color-danger-border)' : 'var(--color-success-border)'}`,
                            color: 'var(--color-success)',
                            fontSize: '14px',
                        }}
                        inputMode="decimal"
                    />
                    <input
                        type="number"
                        step="0.0001"
                        value={sell}
                        onChange={(e) => setSell(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave()
                            if (e.key === 'Escape') handleCancel()
                        }}
                        className="w-14 text-right px-1 py-0.5 font-mono-nums text-[11px] font-bold rounded focus:outline-none"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: `1px solid ${isInvalid ? 'var(--color-danger-border)' : 'var(--color-danger-border)'}`,
                            color: 'var(--color-danger)',
                            fontSize: '14px',
                        }}
                        inputMode="decimal"
                    />
                    <button
                        onClick={handleSave}
                        disabled={isInvalid || update.isPending}
                        title="Valider"
                        className="ml-0.5 w-6 h-6 rounded flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
                        style={{
                            background: 'var(--color-success-bg)',
                            border: '1px solid var(--color-success-border)',
                            color: 'var(--color-success)',
                        }}
                    >
                        <Check size={10} />
                    </button>
                    <button
                        onClick={handleCancel}
                        title="Annuler"
                        className="w-6 h-6 rounded flex items-center justify-center transition-all active:scale-90"
                        style={{
                            background: 'var(--color-bg-input)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-tertiary)',
                        }}
                    >
                        <X size={10} />
                    </button>
                </div>
            )}
        </div>
    )
}