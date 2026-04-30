import { api } from '@/lib/axios'
import type { User } from '@/types/auth.types'

export const usersApi = {
    getClients: () =>
        api.get<User[]>('/users/clients').then((r) => r.data),

    getById: (userId: number) =>
        api.get<User>(`/users/${userId}`).then((r) => r.data),

    getAll: () =>
        api.get<User[]>('/users').then((r) => r.data),
}