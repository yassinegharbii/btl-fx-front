import { Check, CheckCheck } from 'lucide-react'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'

export function LastMessageStatus() {
    const messages    = useChatStore((s) => s.messages)
    const currentUser = useAuthStore((s) => s.user)

    if (!messages.length || !currentUser) return null

    const lastMine = [...messages]
        .reverse()
        .find((m) => m.sender_user_id === currentUser.user_id && m.message_type === 'TEXT')

    if (!lastMine) return null

    /* ─── Configuration des états avec variables CSS ─── */
    const config = {
        SENT: {
            label: 'Envoyé',
            icon: Check,
            color: 'var(--color-text-tertiary)',
            opacity: 0.6,
        },
        DELIVERED: {
            label: 'Distribué',
            icon: CheckCheck,
            color: 'var(--color-text-secondary)',
            opacity: 0.8,
        },
        READ: {
            label: 'Lu',
            icon: CheckCheck,
            color: 'var(--color-success)',
            opacity: 1,
        },
    }[lastMine.status]

    const Icon = config.icon

    return (
        <div className="flex items-center justify-end gap-1 px-4 pb-1 pt-0.5">
            <Icon size={12} style={{ color: config.color, opacity: config.opacity }} />
            <span
                className="text-[10px]"
                style={{ color: config.color, opacity: config.opacity }}
            >
                {config.label}
            </span>
        </div>
    )
}