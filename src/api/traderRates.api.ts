import { api } from '@/lib/axios'
import type {
    TraderRate,
    TraderRatesList,
    TraderRateUpdatePayload,
    TraderRateBatchUpdatePayload,
} from '@/types/traderRate.types'

export const traderRatesApi = {
    /** Récupère tous les taux trader avec timestamp global */
    getAll: async (): Promise<TraderRatesList> => {
        const r = await api.get<TraderRatesList>('/trader-rates')
        return r.data
    },

    /** Récupère un taux trader spécifique */
    getByCode: async (code: string): Promise<TraderRate> => {
        const r = await api.get<TraderRate>(`/trader-rates/${code}`)
        return r.data
    },

    /** Modifie un taux trader (TRADER + ADMIN uniquement) */
    update: async (code: string, payload: TraderRateUpdatePayload): Promise<TraderRate> => {
        const r = await api.put<TraderRate>(`/trader-rates/${code}`, payload)
        return r.data
    },

    /** Modifie plusieurs taux d'un coup (TRADER + ADMIN uniquement) */
    updateBatch: async (payload: TraderRateBatchUpdatePayload): Promise<TraderRate[]> => {
        const r = await api.put<TraderRate[]>('/trader-rates', payload)
        return r.data
    },
}