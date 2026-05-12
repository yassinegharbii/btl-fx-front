import { useQuery, useMutation } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets.api'
import toast from 'react-hot-toast'

import type {
  TicketCreateByClientPayload,
  TicketTraderAcceptPayload,
  TicketTraderCounterPayload,
} from '@/types/ticket.types'

/**
 * Récupère les tickets d'un thread.
 * Pas de polling ; mise à jour via WebSocket (cf. useWebSocket).
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

/* ─── Création par TRADER ─────────────────────────────────────────────── */
export function useCreateTicket(threadId: number) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof ticketsApi.createTicket>[1]) =>
        ticketsApi.createTicket(threadId, payload),
    onSuccess: () => {
      toast.success('Ticket proposé au client')
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur création ticket'
      toast.error(detail)
    },
  })
}

/* ─── ✅ NEW : Création par CLIENT ────────────────────────────────────── */
export function useClientCreateTicket(threadId: number) {
  return useMutation({
    mutationFn: (payload: TicketCreateByClientPayload) =>
        ticketsApi.clientCreateTicket(threadId, payload),
    onSuccess: () => {
      toast.success('Votre proposition a été envoyée')
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur lors de la proposition'
      toast.error(typeof detail === 'string' ? detail : 'Erreur')
    },
  })
}

/* ─── Client accepte / refuse ─────────────────────────────────────────── */
export function useAcceptTicket() {
  return useMutation({
    mutationFn: ticketsApi.acceptTicket,
    onSuccess: () => toast.success('Ticket accepté'),
    onError:   () => toast.error("Erreur acceptation"),
  })
}

export function useDeclineTicket() {
  return useMutation({
    mutationFn: ticketsApi.declineTicket,
    onSuccess: () => toast.success('Ticket refusé'),
    onError:   () => toast.error("Erreur refus"),
  })
}

/* ─── ✅ NEW : Trader accepte ticket client (avec validity) ──────────── */
export function useTraderAcceptClientTicket() {
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: TicketTraderAcceptPayload }) =>
        ticketsApi.traderAcceptClientTicket(orderId, payload),
    onSuccess: () => toast.success('Ticket accepté'),
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur acceptation'
      toast.error(typeof detail === 'string' ? detail : 'Erreur')
    },
  })
}

/* ─── ✅ NEW : Trader refuse ticket client ───────────────────────────── */
export function useTraderDeclineClientTicket() {
  return useMutation({
    mutationFn: ticketsApi.traderDeclineClientTicket,
    onSuccess: () => toast.success('Ticket refusé'),
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur refus'
      toast.error(typeof detail === 'string' ? detail : 'Erreur')
    },
  })
}

/* ─── ✅ NEW : Trader contre ticket client ───────────────────────────── */
export function useTraderCounterTicket() {
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: TicketTraderCounterPayload }) =>
        ticketsApi.traderCounterTicket(orderId, payload),
    onSuccess: () => toast.success('Contre-proposition envoyée'),
    onError: (err: any) => {
      const detail = err.response?.data?.detail ?? 'Erreur contre-proposition'
      toast.error(typeof detail === 'string' ? detail : 'Erreur')
    },
  })
}