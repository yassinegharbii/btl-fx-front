import { useMemo } from 'react'
import {
    Clock, CheckCircle2, XCircle, ClipboardCheck, Award, Hourglass,
    BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useThreadTickets } from '@/hooks/useTickets'
import { useIsMobile }      from '@/hooks/useIsMobile'
import type { Ticket, OrderStatus } from '@/types/ticket.types'

interface Props {
    threadId: number
}

interface StatConfig {
    key:      OrderStatus | 'TOTAL'
    label:    string
    icon:     LucideIcon
    semantic: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const STAT_CONFIGS: StatConfig[] = [
    { key: 'PROPOSED',            label: 'En cours',       icon: Clock,          semantic: 'warning' },
    { key: 'ACCEPTED_BY_CLIENT',  label: 'Acceptés',       icon: CheckCircle2,   semantic: 'success' },
    { key: 'DECLINED_BY_CLIENT',  label: 'Refusés',        icon: XCircle,        semantic: 'danger'  },
    { key: 'CONFIRMED_BY_BRANCH', label: 'Pris en charge', icon: ClipboardCheck, semantic: 'info'    },
    { key: 'COMPLETED',           label: 'Finalisés',      icon: Award,          semantic: 'success' },
    { key: 'EXPIRED',             label: 'Expirés',        icon: Hourglass,      semantic: 'neutral' },
]

export function ConversationStats({ threadId }: Props) {
    const { data: tickets, isLoading } = useThreadTickets(threadId)
    const isMobile = useIsMobile()

    const counts = useMemo(() => {
        const list: Ticket[] = Array.isArray(tickets) ? tickets : []
        const total = list.length

        const byStatus: Record<string, number> = {}
        for (const t of list) {
            byStatus[t.order_status] = (byStatus[t.order_status] ?? 0) + 1
        }

        return { total, byStatus }
    }, [tickets])

    if (isLoading || counts.total === 0) {
        return null
    }

    return (
        <div
            className="flex-shrink-0 border-b"
            style={{
                background: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-divider)',
                animation: 'statsAppear 0.3s ease-out',
            }}
        >
            {isMobile ? (
                <MobileStatsView counts={counts} />
            ) : (
                <DesktopStatsView counts={counts} />
            )}

            <style>{`
                @keyframes statsAppear {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .stats-scroll::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}

/* ─── Vue MOBILE ─────────────────────────────────────────────────── */
function MobileStatsView({
                             counts,
                         }: {
    counts: { total: number; byStatus: Record<string, number> }
}) {
    return (
        <div className="px-3 py-2.5">
            <div
                className="stats-scroll flex gap-2 overflow-x-auto pb-1"
                style={{
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0"
                    style={{
                        background: 'var(--color-success-bg)',
                        border: '1px solid var(--color-success-border)',
                        minWidth: 80,
                    }}
                >
                    <BarChart3 size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <div className="flex flex-col leading-tight">
                        <span className="font-mono-nums text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {counts.total}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider"
                              style={{ color: 'var(--color-text-secondary)' }}>
                            Total
                        </span>
                    </div>
                </div>

                {STAT_CONFIGS.map((cfg) => (
                    <MobileStatChip
                        key={cfg.key}
                        config={cfg}
                        count={counts.byStatus[cfg.key] ?? 0}
                        total={counts.total}
                    />
                ))}
            </div>
        </div>
    )
}

function MobileStatChip({
                            config, count, total,
                        }: {
    config: StatConfig
    count: number
    total: number
}) {
    const Icon = config.icon
    const pct  = total > 0 ? (count / total) * 100 : 0
    const isActive = count > 0

    const colorVar  = `var(--color-${config.semantic})`
    const bgVar     = `var(--color-${config.semantic}-bg)`
    const borderVar = `var(--color-${config.semantic}-border)`

    return (
        <div
            className="px-2 py-1.5 rounded-lg flex items-center gap-2 min-w-0 transition-all flex-shrink-0"
            style={{
                background: isActive ? bgVar : 'var(--color-bg-input)',
                border: `1px solid ${isActive ? borderVar : 'var(--color-border-subtle)'}`,
                opacity: isActive ? 1 : 0.5,
                minWidth: 90,
            }}
            title={`${config.label} : ${count} (${pct.toFixed(1)}%)`}
        >
            <Icon
                size={11}
                style={{ color: isActive ? colorVar : 'var(--color-text-tertiary)', flexShrink: 0 }}
            />
            <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-baseline gap-1">
                    <span
                        className="font-mono-nums text-[13px] font-bold"
                        style={{ color: isActive ? colorVar : 'var(--color-text-tertiary)' }}
                    >
                        {count}
                    </span>
                    {isActive && (
                        <span className="text-[8px] font-mono-nums" style={{ color: 'var(--color-text-tertiary)' }}>
                            {pct.toFixed(0)}%
                        </span>
                    )}
                </div>
                <span
                    className="text-[8px] uppercase tracking-wider truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {config.label}
                </span>
            </div>
        </div>
    )
}

/* ─── Vue DESKTOP ─────────────────────────────────────────────────── */
function DesktopStatsView({
                              counts,
                          }: {
    counts: { total: number; byStatus: Record<string, number> }
}) {
    return (
        <div className="px-5 py-3.5">
            <div className="flex items-stretch gap-3">

                {/* TOTAL — carte plus grande à gauche */}
                <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl flex-shrink-0"
                    style={{
                        background: 'var(--color-success-bg)',
                        border: '1px solid var(--color-success-border)',
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'var(--color-success-bg)',
                            border: '1px solid var(--color-success-border)',
                        }}
                    >
                        <BarChart3 size={16} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span
                            className="font-mono-nums text-2xl font-bold"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {counts.total}
                        </span>
                        <span
                            className="text-[10px] uppercase tracking-widest font-semibold"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Tickets
                        </span>
                    </div>
                </div>

                {/* Séparateur vertical */}
                <div
                    className="w-px flex-shrink-0"
                    style={{ background: 'var(--color-divider)' }}
                />

                {/* 6 stats — chips plus larges */}
                <div className="flex-1 grid grid-cols-6 gap-2 min-w-0">
                    {STAT_CONFIGS.map((cfg) => (
                        <DesktopStatCard
                            key={cfg.key}
                            config={cfg}
                            count={counts.byStatus[cfg.key] ?? 0}
                            total={counts.total}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function DesktopStatCard({
                             config, count, total,
                         }: {
    config: StatConfig
    count: number
    total: number
}) {
    const Icon = config.icon
    const pct  = total > 0 ? (count / total) * 100 : 0
    const isActive = count > 0

    const colorVar  = `var(--color-${config.semantic})`
    const bgVar     = `var(--color-${config.semantic}-bg)`
    const borderVar = `var(--color-${config.semantic}-border)`

    return (
        <div
            className="px-3 py-2.5 rounded-xl flex items-center gap-2.5 min-w-0 transition-all"
            style={{
                background: isActive ? bgVar : 'var(--color-bg-input)',
                border: `1px solid ${isActive ? borderVar : 'var(--color-border-subtle)'}`,
                opacity: isActive ? 1 : 0.45,
            }}
            title={`${config.label} : ${count} (${pct.toFixed(1)}%)`}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                    background: isActive ? bgVar : 'var(--color-bg-tertiary)',
                    border: `1px solid ${isActive ? borderVar : 'var(--color-border-subtle)'}`,
                }}
            >
                <Icon size={14} style={{ color: isActive ? colorVar : 'var(--color-text-tertiary)' }} />
            </div>

            <div className="flex flex-col min-w-0 leading-tight flex-1">
                <div className="flex items-baseline gap-1.5">
                    <span
                        className="font-mono-nums text-[18px] font-bold"
                        style={{ color: isActive ? colorVar : 'var(--color-text-tertiary)' }}
                    >
                        {count}
                    </span>
                    {isActive && total > 0 && (
                        <span
                            className="text-[10px] font-mono-nums font-semibold"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            {pct.toFixed(0)}%
                        </span>
                    )}
                </div>
                <span
                    className="text-[10px] uppercase tracking-wider font-semibold truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {config.label}
                </span>
            </div>
        </div>
    )
}