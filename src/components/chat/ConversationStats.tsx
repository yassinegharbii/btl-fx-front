import { useMemo } from 'react'
import {
    Clock, CheckCircle2, XCircle, ClipboardCheck, Award, Hourglass,
    BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useThreadTickets } from '@/hooks/useTickets'
import type { Ticket, OrderStatus } from '@/types/ticket.types'

interface Props {
    threadId: number
}

interface StatConfig {
    key:    OrderStatus | 'TOTAL'
    label:  string
    icon:   LucideIcon
    color:  string
    bg:     string
    border: string
}

/* ─── Configuration des 6 stats à afficher ──────────────────────────── */
const STAT_CONFIGS: StatConfig[] = [
    {
        key: 'PROPOSED',
        label: 'En cours',
        icon: Clock,
        color:  '#fbbf24',
        bg:     'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.3)',
    },
    {
        key: 'ACCEPTED_BY_CLIENT',
        label: 'Acceptés',
        icon: CheckCircle2,
        color:  '#4ade80',
        bg:     'rgba(74, 222, 128, 0.1)',
        border: 'rgba(74, 222, 128, 0.3)',
    },
    {
        key: 'DECLINED_BY_CLIENT',
        label: 'Refusés',
        icon: XCircle,
        color:  '#fb7185',
        bg:     'rgba(251, 113, 133, 0.1)',
        border: 'rgba(251, 113, 133, 0.3)',
    },
    {
        key: 'CONFIRMED_BY_BRANCH',
        label: 'Pris en charge',
        icon: ClipboardCheck,
        color:  '#60a5fa',
        bg:     'rgba(96, 165, 250, 0.1)',
        border: 'rgba(96, 165, 250, 0.3)',
    },
    {
        key: 'COMPLETED',
        label: 'Finalisés',
        icon: Award,
        color:  '#34d399',
        bg:     'rgba(52, 211, 153, 0.12)',
        border: 'rgba(52, 211, 153, 0.35)',
    },
    {
        key: 'EXPIRED',
        label: 'Expirés',
        icon: Hourglass,
        color:  '#94a3b8',
        bg:     'rgba(148, 163, 184, 0.1)',
        border: 'rgba(148, 163, 184, 0.25)',
    },
]

export function ConversationStats({ threadId }: Props) {
    const { data: tickets, isLoading } = useThreadTickets(threadId)

    /* ─── Compteurs par statut ───────────────────────────────────────── */
    const counts = useMemo(() => {
        const list: Ticket[] = Array.isArray(tickets) ? tickets : []
        const total = list.length

        const byStatus: Record<string, number> = {}
        for (const t of list) {
            byStatus[t.order_status] = (byStatus[t.order_status] ?? 0) + 1
        }

        return { total, byStatus }
    }, [tickets])

    /* ─── Pas de panel si aucun ticket ───────────────────────────────── */
    if (isLoading || counts.total === 0) {
        return null
    }

    return (
        <div
            className="flex-shrink-0 px-4 py-2.5 border-b"
            style={{
                background: 'linear-gradient(180deg, rgba(15, 58, 26, 0.5), rgba(10, 31, 14, 0.4))',
                borderColor: 'rgba(42, 128, 64, 0.25)',
                animation: 'statsAppear 0.3s ease-out',
            }}
        >
            <div className="flex items-center gap-3">

                {/* Total — colonne principale */}
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{
                        background: 'rgba(74, 222, 128, 0.08)',
                        border: '1px solid rgba(74, 222, 128, 0.25)',
                    }}
                >
                    <BarChart3 size={13} style={{ color: '#4ade80' }} />
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-semibold"
                              style={{ color: '#a8c4aa' }}>
                            Total
                        </span>
                        <span className="font-mono-nums text-sm font-bold text-white">
                            {counts.total}
                        </span>
                    </div>
                </div>

                {/* Séparateur vertical */}
                <div className="w-px h-7 flex-shrink-0"
                     style={{ background: 'rgba(42, 128, 64, 0.25)' }} />

                {/* 6 stats par statut */}
                <div className="flex-1 grid grid-cols-6 gap-2 min-w-0">
                    {STAT_CONFIGS.map((cfg) => (
                        <StatChip
                            key={cfg.key}
                            config={cfg}
                            count={counts.byStatus[cfg.key] ?? 0}
                            total={counts.total}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes statsAppear {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

/* ─── Une carte stat compacte ────────────────────────────────────────── */
function StatChip({
                      config, count, total,
                  }: { config: StatConfig; count: number; total: number }) {
    const Icon = config.icon
    const pct  = total > 0 ? (count / total) * 100 : 0
    const isActive = count > 0

    return (
        <div
            className="px-2 py-1.5 rounded-lg flex items-center gap-2 min-w-0 transition-all"
            style={{
                background: isActive ? config.bg : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${isActive ? config.border : 'rgba(255,255,255,0.05)'}`,
                opacity: isActive ? 1 : 0.5,
            }}
            title={`${config.label} : ${count} (${pct.toFixed(1)}%)`}
        >
            <Icon size={11} style={{ color: isActive ? config.color : '#5a8060', flexShrink: 0 }} />

            <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-baseline gap-1">
                    <span className="font-mono-nums text-[13px] font-bold"
                          style={{ color: isActive ? config.color : '#5a8060' }}>
                        {count}
                    </span>
                    {isActive && (
                        <span className="text-[8px] font-mono-nums" style={{ color: '#5a8060' }}>
                            {pct.toFixed(0)}%
                        </span>
                    )}
                </div>
                <span className="text-[8px] uppercase tracking-wider truncate"
                      style={{ color: '#a8c4aa' }}>
                    {config.label}
                </span>
            </div>
        </div>
    )
}