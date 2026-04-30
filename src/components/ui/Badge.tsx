import { cn } from '@/lib/cn'

interface Props {
  children: React.ReactNode
  color?: 'green' | 'red' | 'amber' | 'gray' | 'dark-green'
  className?: string
}

const colors = {
  'green':      'bg-btl-green-light/15 text-btl-green-bright border-btl-green-light/25',
  'dark-green': 'bg-btl-green/25 text-btl-green-pale border-btl-green-mid/35',
  'red':        'bg-fx-sell/12 text-fx-sell border-fx-sell/20',
  'amber':      'bg-fx-gold/15 text-fx-gold border-fx-gold/20',
  'gray':       'bg-white/5 text-white/40 border-white/10',
}

export function Badge({ children, color = 'gray', className }: Props) {
  return (
      <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border',
          colors[color], className
      )}>
      {children}
    </span>
  )
}