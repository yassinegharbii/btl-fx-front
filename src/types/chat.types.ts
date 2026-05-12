export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'
export type MessageType =
    | 'TEXT'
    | 'TICKET_CREATED'
    | 'TICKET_ACCEPTED'
    | 'TICKET_DECLINED'
    | 'TICKET_EXPIRED'
    | 'BRANCH_CONFIRMED'
    | 'BRANCH_COMPLETED'
    | 'TICKET_CREATED_BY_CLIENT'
    | 'TICKET_ACCEPTED_BY_TRADER'
    | 'TICKET_DECLINED_BY_TRADER'
    | 'TICKET_COUNTERED'

export interface Message {
  message_id:     number
  thread_id:      number
  sender_user_id: number
  sender_role:    string
  message_type:   MessageType
  content:        string | null
  status:         MessageStatus
  delivered_at:   string | null
  read_at:        string | null
  created_at:     string
}

export interface Thread {
  thread_id:   number
  client_id:   number
  trader_id:   number | null
  status:      string
  created_at:  string
  updated_at:  string
  closed_at:   string | null
  last_seen_client_at: string | null
  last_seen_trader_at: string | null

  // Snapshot présence au chargement
  client_online: boolean
  trader_online: boolean
}

export type WsOutEvent =
    | { type: 'message';          content: string }
    | { type: 'typing';           data: { is_typing: boolean } }
    | { type: 'mark_all_read' }
    | { type: 'message_read';     data: { message_id: number } }
    | { type: 'message_delivered';data: { message_id: number } }
    | { type: 'last_seen' }

export type WsInEvent =
    | { type: 'history';               messages: Message[] }
    | { type: 'message';               message: Message }
    | { type: 'typing';                data: { user_id: number; is_typing: boolean } }
    | { type: 'presence';              data: { user_id: number; status: 'online' | 'offline'; timestamp: string } }
    | { type: 'message_status_updated';data: { message_id: number; status: MessageStatus; timestamp: string } }
    | { type: 'messages_read';         data: { message_ids: number[]; reader_user_id: number } }
    | { type: 'ticket_created';        ticket: any }
    | { type: 'ticket_accepted';       ticket: any }
    | { type: 'ticket_declined';       ticket: any }
    | { type: 'ticket_expired';        ticket: any }