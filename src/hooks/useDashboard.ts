import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets.api'
import type { DashboardPeriod, DashboardStats } from '@/types/dashboard.types'

/**
 * Hook pour récupérer les stats du dashboard trader.
 *
 * Comportement :
 * - Refetch à chaque montage du composant (= chaque visite du dashboard)
 * - Refetch au changement de période
 * - Refetch manuel via le bouton "Rafraîchir"
 * - PAS de polling automatique
 */
export function useDashboard(period: DashboardPeriod = 'all') {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard', period],
        queryFn:  () => ticketsApi.getDashboard(period),

        // Pas de polling
        refetchInterval: false,
        refetchOnWindowFocus: false,

        // ✅ Refetch à CHAQUE montage du composant
        refetchOnMount: 'always',

        // ✅ staleTime: 0 → données toujours périmées → re-fetch obligatoire au montage
        staleTime: 0,

        // Garder le cache 5min pour éviter le flash visuel
        gcTime: 5 * 60 * 1000,
    })
}