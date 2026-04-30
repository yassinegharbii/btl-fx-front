import { api } from '@/lib/axios'
import type { Ticket, TicketCreatePayload } from '@/types/ticket.types'

export const ticketsApi = {
  getThreadTickets: (threadId: number) =>
    api.get<Ticket[]>(`/tickets/threads/${threadId}`).then((r) => r.data),

  createTicket: (threadId: number, payload: TicketCreatePayload) =>
    api.post<Ticket>(`/tickets/threads/${threadId}`, payload).then((r) => r.data),

  acceptTicket: (orderId: number) =>
    api.post<Ticket>(`/tickets/${orderId}/accept`).then((r) => r.data),

  declineTicket: (orderId: number) =>
    api.post<Ticket>(`/tickets/${orderId}/decline`).then((r) => r.data),

  // Agence
  getByRef: (refTicket: string) =>
    api.get(`/branch/orders/${refTicket}`).then((r) => r.data),

  confirmProcessing: (refTicket: string, note?: string) =>
    api.post(`/branch/orders/${refTicket}/confirm-processing`, { note }).then((r) => r.data),

  confirmCompleted: (refTicket: string, note?: string) =>
    api.post(`/branch/orders/${refTicket}/confirm-completed`, { note }).then((r) => r.data),
}