import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TrendingUp, Users, Search, X } from 'lucide-react'

import { useAllRatesSidebar } from '@/hooks/useRates'
import { useAllThreads }      from '@/hooks/useThread'
import { useAllClients }      from '@/hooks/useUsers'
import { ThreadItem }         from './ThreadItem'
import { Spinner }            from '@/components/ui/Spinner'

function FlagImg({ code, emoji }: { code: string; emoji: string | null }) {
    const [err, setErr] = useState(false)
    if (err) return <span className="text-sm">{emoji ?? code}</span>
    return (
        <img
            src={`/flags/${code}.png`}
            alt={code}
            onError={() => setErr(true)}
            className="w-7 h-5 object-cover rounded-sm"
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
    const { data: rates, isLoading: ratesLoading } = useAllRatesSidebar()
    const liveTime = useLiveTime()

    const { data: threads, isLoading: threadsLoading } = useAllThreads()
    const { data: clients } = useAllClients()
    const { threadId } = useParams()
    const navigate = useNavigate()

    // ✅ Barre de recherche
    const [search, setSearch] = useState('')

    // Map client_id → user pour faire correspondre au thread
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

    // ✅ Filtrer les threads selon la recherche (par username OU full_name)
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
                 background: 'rgba(10, 31, 14, 0.9)',
                 borderRight: '1px solid rgba(42, 128, 64, 0.3)',
             }}>

            {/* SECTION COURS */}
            <div className="flex-shrink-0 max-h-[45%] flex flex-col"
                 style={{ borderBottom: '1px solid rgba(42, 128, 64, 0.25)' }}>

                <div className="px-4 py-3 flex-shrink-0"
                     style={{
                         background: 'rgba(15, 58, 26, 0.8)',
                         borderBottom: '1px solid rgba(42, 128, 64, 0.2)',
                     }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={12} style={{ color: '#4ade80' }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest"
                                  style={{ color: '#a8c4aa' }}>
                                Cours de change
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full inline-block"
                                  style={{ background: '#4ade80', animation: 'pulseDot 1.5s infinite' }} />
                            <span className="text-[9px] uppercase tracking-widest" style={{ color: '#5a8060' }}>
                                Live
                            </span>
                        </div>
                    </div>
                    <div className="text-[10px] font-mono-nums mt-0.5" style={{ color: '#5a8060' }}>
                        {liveTime}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {ratesLoading && (
                        <div className="p-4 text-center text-[11px]" style={{ color: '#5a8060' }}>
                            Chargement...
                        </div>
                    )}
                    {rates?.rates.map((rate, i) => (
                        <div key={rate.code}
                             className="flex items-center px-3 py-1.5 transition-colors"
                             style={{
                                 borderBottom: '1px solid rgba(26, 92, 42, 0.15)',
                                 background: i % 2 !== 0 ? 'rgba(26, 92, 42, 0.06)' : 'transparent',
                             }}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-8 h-6 rounded overflow-hidden border flex items-center justify-center"
                                     style={{
                                         background: 'rgba(255,255,255,0.05)',
                                         borderColor: 'rgba(255,255,255,0.08)',
                                     }}>
                                    <FlagImg code={rate.code} emoji={rate.flag} />
                                </div>
                                <span className="text-[11px] font-bold text-white">{rate.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-12 text-right font-mono-nums text-[11px] font-semibold"
                                      style={{ color: '#4ade80' }}>
                                    {rate.buy.toFixed(3)}
                                </span>
                                <span className="w-12 text-right font-mono-nums text-[11px] font-semibold"
                                      style={{ color: '#fb7185' }}>
                                    {rate.sell.toFixed(3)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SÉPARATEUR + COMPTEUR */}
            <div className="flex-shrink-0 px-4 py-2 flex items-center gap-2"
                 style={{
                     background: 'linear-gradient(90deg, rgba(15,58,26,0.6), rgba(10,31,14,0.9), rgba(15,58,26,0.6))',
                     borderTop: '1px solid rgba(42, 128, 64, 0.3)',
                     borderBottom: '1px solid rgba(42, 128, 64, 0.15)',
                 }}>
                <Users size={11} style={{ color: '#4ade80' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest flex-1"
                      style={{ color: '#a8c4aa' }}>
                    Clients actifs
                </span>
                <span className="text-[10px] font-mono-nums px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                    {filteredThreads.length}{threads && filteredThreads.length !== threads.length ? `/${threads.length}` : ''}
                </span>
            </div>

            {/* ✅ BARRE DE RECHERCHE CLIENTS */}
            <div className="flex-shrink-0 px-3 py-2"
                 style={{
                     background: 'rgba(15, 58, 26, 0.4)',
                     borderBottom: '1px solid rgba(42, 128, 64, 0.15)',
                 }}>
                <div className="relative">
                    <Search size={11}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2"
                            style={{ color: '#5a8060' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un client..."
                        className="w-full pl-7 pr-7 py-1.5 text-[11px] rounded-md focus:outline-none transition-colors"
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#fff',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.4)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded flex items-center justify-center"
                            style={{ color: '#5a8060' }}
                            title="Effacer"
                        >
                            <X size={10} />
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
                    <div className="px-4 py-6 text-center text-[11px]" style={{ color: '#5a8060' }}>
                        Aucun client ne correspond à<br />
                        <span className="font-semibold" style={{ color: '#a8c4aa' }}>« {search} »</span>
                    </div>
                )}

                {!threadsLoading && !threads?.length && (
                    <div className="px-4 py-6 text-center text-[11px]" style={{ color: '#5a8060' }}>
                        Aucune discussion active
                    </div>
                )}
            </div>
        </div>
    )
}