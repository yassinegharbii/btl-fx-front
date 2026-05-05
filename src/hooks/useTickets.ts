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

    // ✅ Refetch à chaque montage (ouverture de la conversation)
    refetchOnMount: 'always',

    // staleTime: 0 → toujours périmé → refetch obligatoire au montage
    staleTime: 0,

    // ❌ Plus de polling automatique 5s
    refetchInterval: false,

    // Pas de refetch quand on revient sur l'onglet
    refetchOnWindowFocus: false,
  })
}

export function useCreateTicket(threadId: number) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof ticketsApi.createTicket>[1]) =>
        ticketsApi.createTicket(threadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', threadId] })
      toast.success('Ticket proposé au client')
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur création ticket'
      toast.error(detail)
    },
  })
}

export function useAcceptTicket() {
  return useMutation({
    mutationFn: ticketsApi.acceptTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket accepté')
    },
    onError: () => toast.error("Erreur acceptation"),
  })
}

export function useDeclineTicket() {
  return useMutation({
    mutationFn: ticketsApi.declineTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      toast.success('Ticket refusé')
    },
    onError: () => toast.error("Erreur refus"),
  })
}