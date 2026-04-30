import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore }  from '@/stores/chat.store'
import { queryClient }   from '@/lib/queryClient'
import toast from 'react-hot-toast'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Reset cache + store AVANT de charger le nouvel user
      useChatStore.getState().reset()
      queryClient.clear()

      // Stocker le token
      const tempApi = (await import('@/lib/axios')).api
      tempApi.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
      const user = await authApi.me()
      setAuth(data.access_token, user)

      const routes: Record<string, string> = {
        CLIENT: '/chat',
        TRADER: '/trader',
        AGENCE: '/agence',
        ADMIN:  '/admin',
      }
      navigate(routes[user.role] ?? '/login')
    },
    onError: () => toast.error('Identifiants incorrects'),
  })
}