import { useQuery, useMutation } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets.api'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'

export function useThreadTickets(threadId: number | null) {
  return useQuery({
    queryKey: ['tickets', threadId],
    queryFn:  () => ticketsApi.getThreadTickets(threadId!),
    enabled:  !!threadId,
    staleTime: 0,
    refetchInterval: 5000,   // ← polling 5s en secours
    refetchOnWindowFocus: true,
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