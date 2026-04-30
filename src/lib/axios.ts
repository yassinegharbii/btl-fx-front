import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

export const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// ─── Inject JWT token automatiquement ────────────────────────────────────────
api.interceptors.request.use((config) => {
    // ✅ NE PAS écraser le header Authorization s'il a déjà été défini
    //    par le caller (ex: Basic Auth pour /rates/update).
    const hasCustomAuth =
        config.headers?.Authorization ||
        config.headers?.authorization

    if (hasCustomAuth) {
        return config
    }

    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ─── Gestion centralisée des 401 ─────────────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status
        const url    = err.config?.url ?? ''

        // ✅ NE PAS déclencher logout pour ces endpoints :
        // - /auth/login : 401 = mauvais identifiants, géré par useLogin onError
        // - /auth/logout : on est déjà en train de se déconnecter
        // - /rates/update : utilise Basic Auth, 401 normal si pas authentifié en Basic
        // - /rates/reset : peut renvoyer 401 selon contexte
        const skipAutoLogout =
            url.includes('/auth/login')   ||
            url.includes('/auth/logout')  ||
            url.includes('/rates/update') ||
            url.includes('/rates/reset')

        if (status === 401 && !skipAutoLogout) {
            const state = useAuthStore.getState()
            // Ne déclencher logout QUE si on était authentifié (token présent)
            if (state.token) {
                // Logout silencieux — on évite POST /auth/logout puisque le token est déjà invalide
                delete api.defaults.headers.common.Authorization
                useAuthStore.setState({ token: null, user: null })

                // Reset stores
                import('@/stores/chat.store').then(({ useChatStore }) => {
                    useChatStore.getState().reset()
                })
                import('@/lib/queryClient').then(({ queryClient }) => {
                    queryClient.clear()
                })

                // Redirection si on n'est pas déjà sur login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }
        }

        return Promise.reject(err)
    }
)