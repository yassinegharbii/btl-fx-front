import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { traderRatesApi } from '@/api/traderRates.api'
import { queryClient } from '@/lib/queryClient'
import type {
    TraderRatesList,
    TraderRateUpdatePayload,
    TraderRateBatchUpdatePayload,
} from '@/types/traderRate.types'

const QUERY_KEY = ['trader-rates'] as const

/**
 * Récupère tous les taux trader.
 * Polling toutes les 10s en fallback (pour les pages sans WS comme /trader dashboard).
 * Sur les pages avec WS (chat trader/client), le WS invalide la query → rafraîchissement instant.
 */
export function useTraderRates() {
    return useQuery<TraderRatesList>({
        queryKey: QUERY_KEY,
        queryFn:  () => traderRatesApi.getAll(),
        refetchInterval: 5_000,        // fallback polling 5s
        refetchOnMount: 'always',
        staleTime: 0,
    })
}

/**
 * Modifier un seul taux.
 * Invalide la query après succès.
 */
export function useUpdateTraderRate() {
    return useMutation({
        mutationFn: ({ code, payload }: { code: string; payload: TraderRateUpdatePayload }) =>
            traderRatesApi.update(code, payload),
        onSuccess: (data) => {
            toast.success(`${data.code} mis à jour`)
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
        onError: (err: any) => {
            const detail = err?.response?.data?.detail
            const msg = typeof detail === 'string'
                ? detail
                : Array.isArray(detail) && detail[0]?.msg
                    ? detail[0].msg.replace('Value error, ', '')
                    : 'Erreur lors de la modification'
            toast.error(msg)
        },
    })
}

/**
 * Modifier plusieurs taux en une seule requête.
 */
export function useUpdateTraderRatesBatch() {
    return useMutation({
        mutationFn: (payload: TraderRateBatchUpdatePayload) =>
            traderRatesApi.updateBatch(payload),
        onSuccess: (data) => {
            toast.success(`${data.length} taux mis à jour`)
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
        onError: (err: any) => {
            const detail = err?.response?.data?.detail
            const msg = typeof detail === 'string'
                ? detail
                : 'Erreur lors de la mise à jour'
            toast.error(msg)
        },
    })
}