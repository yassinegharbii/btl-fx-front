import type { Rate } from '@/types/rate.types'

export function RateTicker({ rates }: { rates: Rate[] }) {
  const items = rates.filter((r) => r.buy != null)

  if (!items.length) return null

  const content = items.map((r) => (
    <span key={r.code}
      className="inline-flex items-center gap-2 px-7 border-r border-white/15
                 text-xl font-semibold tracking-wide">
      <span className="text-2xl">{r.flag}</span>
      <span className="text-white/60">{r.code}</span>
      <span className="text-white/25 mx-1">|</span>
      <span className="font-mono-nums text-white">A: {r.buy.toFixed(3)}</span>
      <span className="text-white/25">·</span>
      <span className="font-mono-nums text-white">V: {r.sell.toFixed(3)}</span>
    </span>
  ))

  return (
    <div className="bg-gradient-to-r from-btl-red-dark via-btl-red to-btl-red-dark
                    py-2.5 overflow-hidden flex-shrink-0 border-b border-black/30">
      <div className="flex animate-ticker whitespace-nowrap">
        <div className="flex">{content}</div>
        <div className="flex">{content}</div>
      </div>
    </div>
  )
}