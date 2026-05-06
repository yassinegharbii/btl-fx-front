import { CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { useChatStore } from '@/stores/chat.store'

interface Props {
    userId: number
    fallbackOnline?: boolean
    className?: string
    style?: CSSProperties
}

export function PresenceDot({ userId, fallbackOnline = false, className, style }: Props) {
    const presence = useChatStore((s) => s.presence[userId])
    const isOnline = presence ? presence === 'online' : fallbackOnline

    return (
        <span
            className={cn('inline-block rounded-full flex-shrink-0', className)}
            style={{
                width: '8px',
                height: '8px',
                background: isOnline ? 'var(--color-success)' : 'var(--color-text-muted)',
                boxShadow: isOnline ? '0 0 8px var(--color-success-border)' : 'none',
                animation: isOnline ? 'pulseDot 1.5s infinite' : 'none',
                ...style,
            }}
        />
    )
}