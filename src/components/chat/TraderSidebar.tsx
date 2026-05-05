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
    const { data: rates, isLoading: ratesLoading } = useAllRatesSidebar()
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
                 background: 'rgba(10, 31, 14, 0.9)',
                 borderRight: '1px solid rgba(42, 128, 64, 0.3)',
             }}>

            {/* SECTION COURS — agrandie */}
            <div className="flex-shrink-0 max-h-[45%] flex flex-col"
                 style={{ borderBottom: '1px solid rgba(42, 128, 64, 0.25)' }}>

                <div className="px-4 py-3 flex-shrink-0"
                     style={{
                         background: 'rgba(15, 58, 26, 0.8)',
                         borderBottom: '1px solid rgba(42, 128, 64, 0.2)',
                     }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={13} style={{ color: '#4ade80' }} />
                            <span className="text-[11px] font-bold uppercase tracking-widest"
                                  style={{ color: '#a8c4aa' }}>
                                Cours de change
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full inline-block"
                                  style={{ background: '#4ade80', animation: 'pulseDot 1.5s infinite' }} />
                            <span className="text-[10px] uppercase tracking-widest" style={{ color: '#5a8060' }}>
                                Live
                            </span>
                        </div>
                    </div>
                    <div className="text-[11px] font-mono-nums mt-1" style={{ color: '#5a8060' }}>
                        {liveTime}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {ratesLoading && (
                        <div className="p-4 text-center text-[12px]" style={{ color: '#5a8060' }}>
                            Chargement...
                        </div>
                    )}
                    {rates?.rates.map((rate, i) => (
                        <div key={rate.code}
                             className="flex items-center px-3 py-2.5 transition-colors"
                             style={{
                                 borderBottom: '1px solid rgba(26, 92, 42, 0.15)',
                                 background: i % 2 !== 0 ? 'rgba(26, 92, 42, 0.06)' : 'transparent',
                             }}>
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-10 h-7 rounded overflow-hidden border flex items-center justify-center"
                                     style={{
                                         background: 'rgba(255,255,255,0.05)',
                                         borderColor: 'rgba(255,255,255,0.08)',
                                     }}>
                                    <FlagImg code={rate.code} emoji={rate.flag} />
                                </div>
                                <span className="text-[14px] font-bold text-white">{rate.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-14 text-right font-mono-nums text-[13px] font-bold"
                                      style={{ color: '#4ade80' }}>
                                    {rate.buy.toFixed(3)}
                                </span>
                                <span className="w-14 text-right font-mono-nums text-[13px] font-bold"
                                      style={{ color: '#fb7185' }}>
                                    {rate.sell.toFixed(3)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SÉPARATEUR + COMPTEUR */}
            <div className="flex-shrink-0 px-4 py-2.5 flex items-center gap-2"
                 style={{
                     background: 'linear-gradient(90deg, rgba(15,58,26,0.6), rgba(10,31,14,0.9), rgba(15,58,26,0.6))',
                     borderTop: '1px solid rgba(42, 128, 64, 0.3)',
                     borderBottom: '1px solid rgba(42, 128, 64, 0.15)',
                 }}>
                <Users size={12} style={{ color: '#4ade80' }} />
                <span className="text-[11px] font-bold uppercase tracking-widest flex-1"
                      style={{ color: '#a8c4aa' }}>
                    Clients actifs
                </span>
                <span className="text-[11px] font-mono-nums px-2 py-0.5 rounded font-bold"
                      style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                    {filteredThreads.length}{threads && filteredThreads.length !== threads.length ? `/${threads.length}` : ''}
                </span>
            </div>

            {/* BARRE DE RECHERCHE */}
            <div className="flex-shrink-0 px-3 py-2.5"
                 style={{
                     background: 'rgba(15, 58, 26, 0.4)',
                     borderBottom: '1px solid rgba(42, 128, 64, 0.15)',
                 }}>
                <div className="relative">
                    <Search size={12}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: '#5a8060' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un client..."
                        className="w-full pl-8 pr-8 py-2 text-[12px] rounded-md focus:outline-none transition-colors"
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#fff',
                            fontSize: '14px',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.4)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center"
                            style={{ color: '#5a8060' }}
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
                    <div className="px-4 py-6 text-center text-[12px]" style={{ color: '#5a8060' }}>
                        Aucun client ne correspond à<br />
                        <span className="font-semibold" style={{ color: '#a8c4aa' }}>« {search} »</span>
                    </div>
                )}

                {!threadsLoading && !threads?.length && (
                    <div className="px-4 py-6 text-center text-[12px]" style={{ color: '#5a8060' }}>
                        Aucune discussion active
                    </div>
                )}
            </div>
        </div>
    )
}