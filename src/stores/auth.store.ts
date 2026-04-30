import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth.types'

interface AuthState {
    token:   string | null
    user:    User | null
    setAuth: (token: string, user: User) => void
    logout:  () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user:  null,
            setAuth: (token, user) => {
                // Reset le store chat avant de définir le nouvel user
                import('@/stores/chat.store').then(({ useChatStore }) => {
                    useChatStore.getState().reset()
                })
                set({ token, user })
            },
            logout: async () => {
                // Notifier le backend AVANT de supprimer le token
                try {
                    const { api } = await import('@/lib/axios')
                    await api.post('/auth/logout')
                } catch {
                    // ignore — si le backend est down, on logout quand même côté client
                }

                import('@/stores/chat.store').then(({ useChatStore }) => {
                    useChatStore.getState().reset()
                })
                import('@/lib/queryClient').then(({ queryClient }) => {
                    queryClient.clear()
                })
                set({ token: null, user: null })
            },
        }),
        { name: 'btl-auth' }
    )
)