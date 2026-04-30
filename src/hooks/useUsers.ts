import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'

export function useUserById(userId: number | null) {
    return useQuery({
        queryKey: ['user', userId],
        queryFn:  () => usersApi.getById(userId!),
        enabled:  !!userId,
        staleTime: 1000 * 60 * 5,
    })
}

export function useAllClients() {
    return useQuery({
        queryKey: ['users', 'clients'],
        queryFn:  usersApi.getClients,
        staleTime: 1000 * 60,
    })
}

export function useAllUsers() {
    return useQuery({
        queryKey: ['users', 'all'],
        queryFn:  usersApi.getAll,
        staleTime: 1000 * 60,
    })
}