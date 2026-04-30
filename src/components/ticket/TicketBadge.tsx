import { cn } from '@/lib/cn'
import type { OrderStatus } from '@/types/ticket.types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; border: string }> = {
  PROPOSED: {
    label: 'En attente',
    bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.25)',
  },
  ACCEPTED_BY_CLIENT: {
    label: 'Accepté',
    bg: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.3)',
  },
  DECLINED_BY_CLIENT: {
    label: 'Refusé',
    bg: 'rgba(251, 113, 133, 0.15)', color: '#fb7185', border: 'rgba(251, 113, 133, 0.25)',
  },
  EXPIRED: {
    label: 'Expiré',
    bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)',
  },
  CONFIRMED_BY_BRANCH: {
    label: 'Pris en charge',
    bg: 'rgba(42, 128, 64, 0.2)', color: '#a8c4aa', border: 'rgba(42, 128, 64, 0.35)',
  },
  COMPLETED: {
    label: 'Finalisé',
    bg: 'rgba(26, 92, 42, 0.35)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.3)',
  },
  CANCELLED: {
    label: 'Annulé',
    bg: 'rgba(251, 113, 133, 0.1)', color: '#fb7185', border: 'rgba(251, 113, 133, 0.2)',
  },
}

export function TicketBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PROPOSED
  return (
      <span
          className="text-[10px] font-medium px-2 py-0.5 rounded border"
          style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      >
      {cfg.label}
    </span>
  )
}