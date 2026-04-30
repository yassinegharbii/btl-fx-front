export type OrderStatus =
  | 'PROPOSED'
  | 'ACCEPTED_BY_CLIENT'
  | 'DECLINED_BY_CLIENT'
  | 'EXPIRED'
  | 'CONFIRMED_BY_BRANCH'
  | 'COMPLETED'
  | 'CANCELLED'

export type Operation    = 'BUY' | 'SELL'
export type DeliveryMode = 'CASH' | 'ACCOUNT' | 'TRANSFER' | 'CHEQUE' | 'BORDEREAU'

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
  proposed_by_trader_id: number
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
  valid_until:           string | null
  client_decision_at:    string | null
  branch_confirmed_at:   string | null
  completed_at:          string | null
  created_at:            string
  updated_at:            string
}

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