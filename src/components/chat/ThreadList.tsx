import { useAllThreads } from '@/hooks/useThread'
import { ThreadItem }    from './ThreadItem'
import { Spinner }       from '@/components/ui/Spinner'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore }  from '@/stores/auth.store'
import { LogOut } from 'lucide-react'

export function ThreadList() {
  const { data: threads, isLoading } = useAllThreads()
  const { threadId } = useParams()
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const logout   = useAuthStore((s) => s.logout)

  return (
    <div className="flex flex-col h-full"
      style={{ background: 'rgba(10,31,14,0.9)', borderRight: '1px solid rgba(26,92,42,0.3)' }}>

      {/* Header avec infos trader + logout */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(26,92,42,0.3)', background: 'rgba(15,58,26,0.7)' }}>
        <div>
          <div className="text-sm font-semibold text-white">{user?.full_name ?? user?.username}</div>
          <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: '#5a8060' }}>
            Trader — {threads?.length ?? 0} discussion{(threads?.length ?? 0) > 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={logout}
          title="Déconnexion"
          className="text-white/20 hover:text-white/60 transition-colors p-1.5 rounded-lg
                     hover:bg-btl-red/20"
        >
          <LogOut size={15} />
        </button>
      </div>

      {/* Séparateur label */}
      <div className="px-4 py-1.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(26,92,42,0.15)' }}>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: '#5a8060' }}>
          Clients actifs
        </span>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8"><Spinner /></div>
        )}
        {threads?.map((thread) => (
          <ThreadItem
            key={thread.thread_id}
            thread={thread}
            active={String(thread.thread_id) === threadId}
            onClick={() => navigate(`/trader/${thread.thread_id}`)}
          />
        ))}
        {!isLoading && !threads?.length && (
          <div className="px-4 py-8 text-center text-xs" style={{ color: '#5a8060' }}>
            Aucune discussion active
          </div>
        )}
      </div>
    </div>
  )
}