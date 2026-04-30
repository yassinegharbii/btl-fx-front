import { ReactNode } from 'react'
import { RateSidebar } from '@/components/rates/RateSidebar'

interface Props {
  children: ReactNode
  showRates?: boolean
}

export function AppShell({ children, showRates = true }: Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-navy-900">
      {showRates && (
        <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col">
          <RateSidebar />
        </aside>
      )}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}