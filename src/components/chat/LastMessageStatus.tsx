import { Check, CheckCheck } from 'lucide-react'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'

export function LastMessageStatus() {
    const messages    = useChatStore((s) => s.messages)
    const currentUser = useAuthStore((s) => s.user)

    if (!messages.length || !currentUser) return null

    // Chercher le dernier message TEXT envoyé par l'utilisateur courant
    const lastMine = [...messages]
        .reverse()
        .find((m) => m.sender_user_id === currentUser.user_id && m.message_type === 'TEXT')

    if (!lastMine) return null

    const config = {
        SENT:      { label: 'Envoyé',   icon: Check,      color: 'rgba(168, 196, 170, 0.4)' },
        DELIVERED: { label: 'Distribué', icon: CheckCheck, color: 'rgba(168, 196, 170, 0.6)' },
        READ:      { label: 'Lu',       icon: CheckCheck, color: '#4ade80' },
    }[lastMine.status]

    const Icon = config.icon

    return (
        <div className="flex items-center justify-end gap-1 px-4 pb-1 pt-0.5">
            <Icon size={12} style={{ color: config.color }} />
            <span className="text-[10px]" style={{ color: config.color }}>
        {config.label}
      </span>
        </div>
    )
}