import { useQuery, useMutation } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets.api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'

/**
 * Récupère les tickets d'un thread.
 *
 * Comportement :
 * - Refetch à CHAQUE montage du composant (chaque ouverture de conversation)
 * - Pas de polling automatique
 * - Mise à jour via WebSocket (ticket_created, ticket_accepted, ticket_declined)
 *   qui déclenchent invalidateQueries → refetch
 */
export function useThreadTickets(threadId: number | null) {
  return useQuery({
    queryKey: ['tickets', threadId],
    queryFn:  () => ticketsApi.getThreadTickets(threadId!),
    enabled:  !!threadId,
    refetchOnMount: 'always',
    staleTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Création de ticket (TRADER).
 * Pas d'invalidation manuelle : le broadcast WS 'ticket_created' s'en charge.
 */
export function useCreateTicket(threadId: number) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof ticketsApi.createTicket>[1]) =>
        ticketsApi.createTicket(threadId, payload),
    onSuccess: () => {
      // Pas d'invalidation : le broadcast WS 'ticket_created' va invalider
      // la query côté trader ET côté client en même temps.
      toast.success('Ticket proposé au client')
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur création ticket'
      toast.error(detail)
    },
  })
}

/**
 * Acceptation de ticket (CLIENT).
 * Pas d'invalidation manuelle : le broadcast WS 'ticket_accepted' s'en charge.
 */
export function useAcceptTicket() {
  return useMutation({
    mutationFn: ticketsApi.acceptTicket,
    onSuccess: () => {
      toast.success('Ticket accepté')
    },
    onError: () => toast.error("Erreur acceptation"),
  })
}

/**
 * Refus de ticket (CLIENT).
 * Pas d'invalidation manuelle : le broadcast WS 'ticket_declined' s'en charge.
 */
export function useDeclineTicket() {
  return useMutation({
    mutationFn: ticketsApi.declineTicket,
    onSuccess: () => {
      toast.success('Ticket refusé')
    },
    onError: () => toast.error("Erreur refus"),
  })
}

/* ─── Helper inutilisé importé pour éviter le warning lint si besoin ─── */
void queryClient