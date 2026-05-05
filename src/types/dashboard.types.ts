import type { OrderStatus } from './ticket.types'

export type DashboardPeriod = 'day' | 'week' | 'month' | 'year' | 'all'

export interface DashboardTotals {
    total:     number
    proposed:  number
    accepted:  number
    declined:  number
    confirmed: number
    completed: number
    expired:   number
    cancelled: number
}

export interface DashboardTopClient {
    client_id:    number
    client_name:  string | null
    username:     string | null
    tickets:      number
    accepted:     number
    completed:    number
    success_rate: number
}

export interface DashboardRecentActivity {
    order_id:    number
    ref_ticket:  string
    thread_id:   number              // ✅ NOUVEAU — pour naviguer vers la conversation
    status:      OrderStatus
    client_id:   number
    client_name: string | null
    username:    string | null
    currency:    string | null
    operation:   'BUY' | 'SELL'
    amount:      number
    created_at:  string | null
    updated_at:  string | null
}

export interface DashboardDailyPoint {
    date:     string
    label:    string
    count:    number
    accepted: number
}

export interface DashboardStats {
    period:           DashboardPeriod
    totals:           DashboardTotals
    top_clients:      DashboardTopClient[]
    recent_activity:  DashboardRecentActivity[]
    daily_evolution:  DashboardDailyPoint[]
}