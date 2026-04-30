import { cn } from '@/lib/cn'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'lime' | 'mint' | 'forest'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

// Nuances de vert — aucun bleu
const colors = {
  green:  { bg: 'rgba(74, 222, 128, 0.15)',  text: '#4ade80', border: 'rgba(74, 222, 128, 0.25)' },
  lime:   { bg: 'rgba(163, 230, 53, 0.15)',  text: '#a3e635', border: 'rgba(163, 230, 53, 0.25)' },
  mint:   { bg: 'rgba(52, 211, 153, 0.15)',  text: '#34d399', border: 'rgba(52, 211, 153, 0.25)' },
  forest: { bg: 'rgba(26, 92, 42, 0.35)',    text: '#a8c4aa', border: 'rgba(42, 128, 64, 0.4)' },
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export function Avatar({ name, size = 'md', color = 'green', className }: Props) {
  const c = colors[color]
  return (
      <div
          className={cn(
              'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
              sizes[size], className
          )}
          style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      >
        {initials(name)}
      </div>
  )
}