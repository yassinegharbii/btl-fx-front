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

const colors = {
  green:  {
    bg:     'var(--color-success-bg)',
    text:   'var(--color-success)',
    border: 'var(--color-success-border)',
  },
  lime:   {
    bg:     'var(--color-success-bg)',
    text:   'var(--color-success)',
    border: 'var(--color-success-border)',
  },
  mint:   {
    bg:     'var(--color-success-bg)',
    text:   'var(--color-success)',
    border: 'var(--color-success-border)',
  },
  forest: {
    bg:     'var(--color-bg-tertiary)',
    text:   'var(--color-text-secondary)',
    border: 'var(--color-border)',
  },
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
          style={{
            background: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
          }}
      >
        {initials(name)}
      </div>
  )
}