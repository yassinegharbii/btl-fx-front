import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { Avatar }       from '@/components/ui/Avatar'
import { PresenceDot }  from './PresenceDot'
import { useUnreadCount } from '@/hooks/useThread'
import { useUserById }    from '@/hooks/useUsers'
import type { Thread }    from '@/types/chat.types'

interface Props {
  thread:  Thread
  active?: boolean
  onClick: () => void
}

export function ThreadItem({ thread, active, onClick }: Props) {
  const { data: client } = useUserById(thread.client_id)
  const { data: unread } = useUnreadCount(thread.thread_id)
  const unreadCount = active ? 0 : (unread?.unread_count ?? 0)

  const [hover, setHover] = useState(false)

  const displayName = client?.full_name ?? client?.username ?? `Client #${thread.client_id}`

  const timeAgo = formatDistanceToNow(new Date(thread.updated_at), {
    addSuffix: false,
    locale: fr,
  })

  /* ─── Calcul du fond selon état (active > hover > normal) ─── */
  const background = active
      ? 'var(--color-success-bg)'
      : hover
          ? 'var(--color-bg-card-hover)'
          : 'transparent'

  return (
      <button
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2"
          style={{
            background,
            borderLeftColor: active ? 'var(--color-success)' : 'transparent',
          }}
      >
        <div className="relative flex-shrink-0">
          <Avatar name={displayName} size="md" color="green" />
          <PresenceDot
              userId={thread.client_id}
              fallbackOnline={thread.client_online}
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3"
              style={{ border: '2px solid var(--color-bg-secondary)' }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}>
                        {displayName}
                    </span>
            <span className="text-[10px] flex-shrink-0 ml-2"
                  style={{ color: 'var(--color-text-tertiary)' }}>
                        {timeAgo}
                    </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] truncate"
                          style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                        {thread.status === 'OPEN' ? 'Discussion active' : thread.status}
                    </span>
            {unreadCount > 0 && (
                <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 rounded-full
                                         text-[10px] font-bold
                                         flex items-center justify-center px-1.5"
                      style={{
                        background: 'var(--color-accent-secondary)',
                        color: '#fff',
                      }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
            )}
          </div>
        </div>
      </button>
  )
}