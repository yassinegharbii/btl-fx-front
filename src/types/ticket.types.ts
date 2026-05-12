/* ─── Statuts complets (incluant nouveaux statuts client-initiated) ─── */
export type OrderStatus =
    | 'PROPOSED'
    | 'PROPOSED_BY_CLIENT'        // ✅ NEW : créé par client
    | 'COUNTERED_BY_TRADER'       // ✅ NEW : trader a contré
    | 'ACCEPTED_BY_CLIENT'
    | 'ACCEPTED_BY_TRADER'        // ✅ NEW : trader accepte ticket client
    | 'DECLINED_BY_CLIENT'
    | 'DECLINED_BY_TRADER'        // ✅ NEW : trader refuse ticket client
    | 'EXPIRED'
    | 'CONFIRMED_BY_BRANCH'
    | 'COMPLETED'
    | 'CANCELLED'

export type Operation       = 'BUY' | 'SELL'
export type DeliveryMode    = 'CASH' | 'ACCOUNT' | 'TRANSFER' | 'CHEQUE' | 'BORDEREAU'
export type CreatedByRole   = 'TRADER' | 'CLIENT'

export interface TicketBill {
  id:         number
  order_id:   number
  bill_value: string
  quantity:   number
}

export interface Ticket {
  order_id:              number
  ref_ticket:            string
  thread_id:             number
  client_id:             number

  /* ✅ Nouveaux champs */
  created_by_user_id:    number
  created_by_role:       CreatedByRole

  currency_id:           number
  currency_code:         string | null
  currency_label:        string | null
  operation:             Operation
  order_amount:          number
  delivery_mode:         DeliveryMode
  branch_code:           string
  branch_name:           string | null
  bills:                 TicketBill[]
  order_status:          OrderStatus
  market_rate_used:      number | null
  market_tnd_equivalent: number | null
  negotiated_price:      number | null
  tnd_equivalent:        number | null
  trader_comment:        string | null
  client_comment:        string | null      // ✅ NEW
  branch_comment:        string | null
  valid_until:           string | null
  client_decision_at:    string | null
  branch_confirmed_at:   string | null
  completed_at:          string | null
  created_at:            string
  updated_at:            string
}

/* ─── Création par TRADER (existant) ─────────────────────────────────── */
export interface TicketCreatePayload {
  currency_id:    number
  operation:      Operation
  order_amount:   number
  delivery_mode:  DeliveryMode
  branch_code:    string
  negotiated_price: number
  validity_min:   number
  trader_comment: string | null
  bills:          { bill_value: string; quantity: number }[]
}

/* ─── ✅ NEW : Création par CLIENT ────────────────────────────────────── */
export interface TicketCreateByClientPayload {
  currency_id:      number
  operation:        Operation
  order_amount:     number
  branch_code:      string
  negotiated_price: number
  client_comment:   string | null
}

/* ─── ✅ NEW : Trader accepte ticket client ──────────────────────────── */
export interface TicketTraderAcceptPayload {
  validity_min:   number       // 5-30 minutes
  trader_comment: string | null
}

/* ─── ✅ NEW : Trader contre ticket client ───────────────────────────── */
export interface TicketTraderCounterPayload {
  negotiated_price: number
  validity_min:     number
  trader_comment:   string | null
}