import { api } from '@/lib/axios'
import type {
  Ticket,
  TicketCreatePayload,
  TicketCreateByClientPayload,
  TicketTraderAcceptPayload,
  TicketTraderCounterPayload,
} from '@/types/ticket.types'
import type { DashboardPeriod, DashboardStats } from '@/types/dashboard.types'

export const ticketsApi = {
  /* ─── Lecture ─── */
  getThreadTickets: (threadId: number) =>
      api.get<Ticket[]>(`/tickets/threads/${threadId}`).then((r) => r.data),

  /* ─── ✅ NEW : Récupérer un ticket par sa référence (FX-XXXXXX) ─── */
  /* Utilisé pour le popover détails sur message bubble */
  getByRef: (refTicket: string) =>
      api.get<Ticket>(`/tickets/by-ref/${refTicket}`).then((r) => r.data),

  /* ─── Création par TRADER (existant) ─── */
  createTicket: (threadId: number, payload: TicketCreatePayload) =>
      api.post<Ticket>(`/tickets/threads/${threadId}`, payload).then((r) => r.data),

  /* ─── Création par CLIENT ─── */
  clientCreateTicket: (threadId: number, payload: TicketCreateByClientPayload) =>
      api.post<Ticket>(`/tickets/threads/${threadId}/client`, payload).then((r) => r.data),

  /* ─── Client accepte / refuse ─── */
  acceptTicket: (orderId: number) =>
      api.post<Ticket>(`/tickets/${orderId}/accept`).then((r) => r.data),

  declineTicket: (orderId: number) =>
      api.post<Ticket>(`/tickets/${orderId}/decline`).then((r) => r.data),

  /* ─── Trader accepte ticket client (avec validity) ─── */
  traderAcceptClientTicket: (orderId: number, payload: TicketTraderAcceptPayload) =>
      api.post<Ticket>(`/tickets/${orderId}/trader-accept`, payload).then((r) => r.data),

  /* ─── Trader refuse ticket client ─── */
  traderDeclineClientTicket: (orderId: number) =>
      api.post<Ticket>(`/tickets/${orderId}/trader-decline`).then((r) => r.data),

  /* ─── Trader contre ticket client ─── */
  traderCounterTicket: (orderId: number, payload: TicketTraderCounterPayload) =>
      api.post<Ticket>(`/tickets/${orderId}/counter`, payload).then((r) => r.data),

  /* ─── Dashboard trader ─── */
  getDashboard: (period: DashboardPeriod = 'all') =>
      api
          .get<DashboardStats>('/tickets/dashboard', { params: { period } })
          .then((r) => r.data),

  /* ─── Agence : récupérer par ref (workflow agence, différent de getByRef) ─── */
  /* ✅ Renommé : avant getByRef → maintenant branchGetByRef */
  branchGetByRef: (refTicket: string) =>
      api.get(`/branch/orders/${refTicket}`).then((r) => r.data),

  confirmProcessing: (refTicket: string, note?: string) =>
      api.post(`/branch/orders/${refTicket}/confirm-processing`, { note }).then((r) => r.data),

  confirmCompleted: (refTicket: string, note?: string) =>
      api.post(`/branch/orders/${refTicket}/confirm-completed`, { note }).then((r) => r.data),
}