import { useEffect, useState, useRef } from 'react'

interface Props {
  validUntil: string | null
  createdAt?: string | null
}

export function ExpiryBar({ validUntil, createdAt }: Props) {
  const [pct, setPct]     = useState(100)
  const [label, setLabel] = useState('')
  const [expired, setExpired] = useState(false)

  const totalDurationRef = useRef<number>(0)

  useEffect(() => {
    if (!validUntil) return

    const end = new Date(validUntil).getTime()
    const start = createdAt ? new Date(createdAt).getTime() : Date.now()
    totalDurationRef.current = end - start

    const tick = () => {
      const now = Date.now()
      const remaining = end - now

      if (remaining <= 0) {
        setPct(0)
        setLabel('Expiré')
        setExpired(true)
        return
      }

      const mins = Math.floor(remaining / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)

      if (mins >= 60) {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        setLabel(`${h}h ${m}min`)
      } else {
        setLabel(`${mins}m ${secs}s`)
      }

      const total = totalDurationRef.current
      if (total > 0) {
        setPct(Math.min(100, Math.max(0, (remaining / total) * 100)))
      } else {
        setPct(100)
      }
      setExpired(false)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [validUntil, createdAt])

  return (
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-[10px]">
          <span style={{ color: '#5a8060' }}>Validité</span>
          <span className="font-mono-nums font-semibold"
                style={{ color: expired ? '#fb7185' : pct > 40 ? '#a8c4aa' : '#fbbf24' }}>
          {label}
        </span>
        </div>
        <div className="h-1 w-full rounded-full overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${pct}%`,
                background: expired
                    ? 'linear-gradient(90deg, #fb7185, #dc2626)'
                    : pct > 40
                        ? 'linear-gradient(90deg, #2a8040, #4ade80)'
                        : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                boxShadow: !expired ? '0 0 8px rgba(74, 222, 128, 0.3)' : 'none',
              }}
          />
        </div>
      </div>
  )
}