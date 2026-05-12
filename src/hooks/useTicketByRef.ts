import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets.api'
import type { Ticket } from '@/types/ticket.types'

/**
 * Récupère un ticket par sa référence (ex: "FX-000123").
 * Cherche d'abord dans tous les caches de tickets du thread,
 * puis fetch si pas trouvé.
 */
export function useTicketByRef(refTicket: string | null) {
    return useQuery<Ticket | null>({
        queryKey: ['ticket-by-ref', refTicket],
        queryFn: async () => {
            if (!refTicket) return null
            try {
                return await ticketsApi.getByRef(refTicket)
            } catch {
                return null
            }
        },
        enabled: !!refTicket,
        staleTime: 30_000,
    })
}