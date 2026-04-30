import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useAllRatesSidebar } from '@/hooks/useRates'

function FlagImg({ code, emoji }: { code: string; emoji: string | null }) {
    const [err, setErr] = useState(false)
    if (err) return <span className="text-base">{emoji ?? code}</span>
    return (
        <img
            src={`/flags/${code}.png`}
            alt={code}
            onError={() => setErr(true)}
            className="w-8 h-5 object-cover rounded-sm"
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

export function RateSidebar() {
    const { data, isLoading } = useAllRatesSidebar()
    const liveTime = useLiveTime()

    return (
        <div className="flex flex-col h-full overflow-hidden"
             style={{
                 background: 'rgba(10,31,14,0.85)',
                 borderRight: '1px solid rgba(26,92,42,0.3)',
             }}>

            <div className="px-3 py-3 flex-shrink-0"
                 style={{
                     borderBottom: '1px solid rgba(26,92,42,0.3)',
                     background: 'rgba(15,58,26,0.8)',
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
                <div className="text-[11px] font-mono-nums mt-0.5" style={{ color: '#5a8060' }}>
                    {liveTime}
                </div>

                <div className="flex mt-2 text-[9px] uppercase tracking-wider" style={{ color: '#5a8060' }}>
                    <span className="flex-1">Devise</span>
                    <span className="w-12 text-right" style={{ color: '#4ade80' }}>Achat</span>
                    <span className="w-12 text-right ml-1" style={{ color: '#fb7185' }}>Vente</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="px-3 py-6 text-[11px] text-center" style={{ color: '#5a8060' }}>
                        Chargement...
                    </div>
                )}
                {data?.rates.map((rate, i) => (
                    <div key={rate.code}
                         style={{
                             borderBottom: '1px solid rgba(26, 92, 42, 0.15)',
                             background: i % 2 !== 0 ? 'rgba(26, 92, 42, 0.08)' : 'transparent',
                         }}
                         className="flex items-center px-3 py-2.5 transition-colors">

                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-9 h-6 rounded overflow-hidden border
                              flex items-center justify-center"
                                 style={{
                                     background: 'rgba(255,255,255,0.05)',
                                     borderColor: 'rgba(255,255,255,0.1)',
                                 }}>
                                <FlagImg code={rate.code} emoji={rate.flag} />
                            </div>
                            {/* ✅ Uniquement le code, plus de nom */}
                            <div className="text-[13px] font-bold text-white">{rate.code}</div>
                        </div>

                        <div className="w-14 text-right font-mono-nums text-[12px] font-semibold"
                             style={{ color: '#4ade80' }}>
                            {rate.buy.toFixed(3)}
                        </div>
                        <div className="w-14 text-right font-mono-nums text-[12px] font-semibold ml-1"
                             style={{ color: '#fb7185' }}>
                            {rate.sell.toFixed(3)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}