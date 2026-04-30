import { TrendingUp, LogOut } from 'lucide-react'
import { TraderSidebar } from '@/components/chat/TraderSidebar'
import { useAuthStore } from '@/stores/auth.store'

export default function TraderDashboard() {
  const user   = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
      <div className="flex h-screen overflow-hidden" style={{ background: '#070d09' }}>

        <aside className="w-72 flex-shrink-0">
          <TraderSidebar />
        </aside>

        <main className="flex-1 flex flex-col items-center justify-center relative"
              style={{
                background: `
            radial-gradient(ellipse 60% 50% at 50% 30%, rgba(26,92,42,0.12) 0%, transparent 60%),
            #070d09`,
              }}>

          <button
              onClick={logout}
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
              style={{
                background: 'rgba(15, 58, 26, 0.5)',
                border: '1px solid rgba(42, 128, 64, 0.3)',
                color: '#a8c4aa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(200, 16, 46, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(200, 16, 46, 0.4)'
                e.currentTarget.style.color = '#fb7185'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 58, 26, 0.5)'
                e.currentTarget.style.borderColor = 'rgba(42, 128, 64, 0.3)'
                e.currentTarget.style.color = '#a8c4aa'
              }}>
            <LogOut size={14} />
            Déconnexion
          </button>

          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                 style={{
                   background: 'rgba(42, 128, 64, 0.15)',
                   border: '1px solid rgba(74, 222, 128, 0.25)',
                 }}>
              <TrendingUp size={32} style={{ color: '#4ade80' }} />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Bonjour {user?.full_name ?? user?.username}
            </h2>
            <p className="text-sm max-w-sm" style={{ color: '#a8c4aa' }}>
              Sélectionnez un client dans la liste à gauche pour démarrer ou reprendre une négociation
            </p>
          </div>
        </main>
      </div>
  )
}