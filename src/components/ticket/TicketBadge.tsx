import type { OrderStatus } from '@/types/ticket.types'

interface BadgeConfig {
  label:    string
  semantic: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent'
}

const STATUS_CONFIG: Record<OrderStatus, BadgeConfig> = {
  /* ─── Existants ─── */
  PROPOSED:            { label: 'En attente',     semantic: 'warning' },
  ACCEPTED_BY_CLIENT:  { label: 'Accepté',        semantic: 'success' },
  DECLINED_BY_CLIENT:  { label: 'Refusé',         semantic: 'danger'  },
  EXPIRED:             { label: 'Expiré',         semantic: 'neutral' },
  CONFIRMED_BY_BRANCH: { label: 'Pris en charge', semantic: 'info'    },
  COMPLETED:           { label: 'Finalisé',       semantic: 'success' },
  CANCELLED:           { label: 'Annulé',         semantic: 'danger'  },

  /* ─── ✅ NEW : Workflow client-initiated ─── */
  PROPOSED_BY_CLIENT:  { label: 'Demande client',     semantic: 'warning' },
  COUNTERED_BY_TRADER: { label: 'Contre-proposition', semantic: 'info'    },
  ACCEPTED_BY_TRADER:  { label: 'Accepté trader',     semantic: 'success' },
  DECLINED_BY_TRADER:  { label: 'Refusé trader',      semantic: 'danger'  },
}

function getSemanticVars(semantic: BadgeConfig['semantic']) {
  if (semantic === 'accent') {
    return {
      color:  'var(--color-accent-pale)',
      bg:     'var(--color-success-bg)',
      border: 'var(--color-success-border)',
    }
  }
  return {
    color:  `var(--color-${semantic})`,
    bg:     `var(--color-${semantic}-bg)`,
    border: `var(--color-${semantic}-border)`,
  }
}

export function TicketBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PROPOSED
  const vars = getSemanticVars(cfg.semantic)

  return (
      <span
          className="text-[10px] font-medium px-2 py-0.5 rounded border"
          style={{
            background: vars.bg,
            color: vars.color,
            borderColor: vars.border,
          }}
      >
            {cfg.label}
        </span>
  )
}