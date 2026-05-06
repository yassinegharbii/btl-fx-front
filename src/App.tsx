import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useAuthStore } from '@/stores/auth.store'
import { ThemeProvider } from '@/theme'
import { ThemedToaster } from '@/components/ui/ThemedToaster'

import LoginPage           from '@/pages/LoginPage'
import PublicRatesPage     from '@/pages/PublicRatesPage'
import ChangePasswordPage  from '@/pages/ChangePasswordPage'
import ClientChatPage      from '@/pages/client/ClientChatPage'
import TraderDashboard     from '@/pages/trader/TraderDashboard'
import TraderChatPage      from '@/pages/trader/TraderChatPage'
import AgencePage          from '@/pages/agence/AgencePage'
import AdminPage           from '@/pages/admin/AdminPage'

/**
 * Wrapper qui force la redirection vers /change-password
 * si l'utilisateur a must_change_password = 1
 */
function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const mustChange = user?.must_change_password === 1 || (user as any)?.must_change_password === true

  if (mustChange) {
    return <Navigate to="/change-password" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/rates" element={<PublicRatesPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Forced password change */}
            <Route element={<AuthGuard roles={['CLIENT', 'TRADER', 'AGENCE', 'ADMIN']} />}>
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* CLIENT */}
            <Route element={<AuthGuard roles={['CLIENT']} />}>
              <Route path="/chat" element={
                <PasswordChangeGuard>
                  <ClientChatPage />
                </PasswordChangeGuard>
              } />
            </Route>

            {/* TRADER */}
            <Route element={<AuthGuard roles={['TRADER', 'ADMIN']} />}>
              <Route path="/trader" element={
                <PasswordChangeGuard>
                  <TraderDashboard />
                </PasswordChangeGuard>
              } />
              <Route path="/trader/:threadId" element={
                <PasswordChangeGuard>
                  <TraderChatPage />
                </PasswordChangeGuard>
              } />
            </Route>

            {/* AGENCE */}
            <Route element={<AuthGuard roles={['AGENCE', 'ADMIN']} />}>
              <Route path="/agence" element={
                <PasswordChangeGuard>
                  <AgencePage />
                </PasswordChangeGuard>
              } />
            </Route>

            {/* ADMIN */}
            <Route element={<AuthGuard roles={['ADMIN']} />}>
              <Route path="/admin" element={
                <PasswordChangeGuard>
                  <AdminPage />
                </PasswordChangeGuard>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Toaster qui s'adapte au thème */}
        <ThemedToaster />
      </ThemeProvider>
  )
}