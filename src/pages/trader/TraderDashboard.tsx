import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LogOut, Menu, BarChart3, Clock, CheckCircle2, XCircle,
    ClipboardCheck, Award, Hourglass, TrendingUp, TrendingDown,
    Users, Activity, RefreshCw, ArrowRight,
    UserPlus, Repeat,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Area, AreaChart,
} from 'recharts'

import { TraderSidebar } from '@/components/chat/TraderSidebar'
import { useAuthStore }  from '@/stores/auth.store'
import { useIsMobile }   from '@/hooks/useIsMobile'
import { useDashboard }  from '@/hooks/useDashboard'
import { useTheme }      from '@/theme'
import { MobileDrawer }  from '@/components/ui/MobileDrawer'
import { ThemeToggle }   from '@/components/ui/ThemeToggle'
import type {
    DashboardPeriod, DashboardTopClient, DashboardRecentActivity, DashboardTotals,
} from '@/types/dashboard.types'
import type { OrderStatus } from '@/types/ticket.types'

type StatKey = keyof DashboardTotals

interface StatCardConfig {
    key:    StatKey
    label:  string
    icon:   LucideIcon
    /** Couleur sémantique (var CSS sans le -bg/-border suffixe) */
    semantic: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

/* ─── Configuration des stats avec couleurs sémantiques ─── */
const STAT_CARDS: StatCardConfig[] = [
    { key: 'total',     label: 'Total',          icon: BarChart3,      semantic: 'success' },
    { key: 'proposed',  label: 'En cours',       icon: Clock,          semantic: 'warning' },
    { key: 'accepted',  label: 'Acceptés',       icon: CheckCircle2,   semantic: 'success' },
    { key: 'declined',  label: 'Refusés',        icon: XCircle,        semantic: 'danger' },
    { key: 'confirmed', label: 'Pris en charge', icon: ClipboardCheck, semantic: 'info' },
    { key: 'completed', label: 'Finalisés',      icon: Award,          semantic: 'success' },
    { key: 'expired',   label: 'Expirés',        icon: Hourglass,      semantic: 'neutral' },
]

const PERIODS: Array<{ key: DashboardPeriod; label: string; mobileLabel: string }> = [
    { key: 'day',   label: "Aujourd'hui", mobileLabel: 'Jour' },
    { key: 'week',  label: '7 jours',     mobileLabel: '7j' },
    { key: 'month', label: '30 jours',    mobileLabel: '30j' },
    { key: 'year',  label: '1 an',        mobileLabel: '1an' },
    { key: 'all',   label: 'Tout',        mobileLabel: 'Tout' },
]

export default function TraderDashboard() {
    const user     = useAuthStore((s) => s.user)
    const logout   = useAuthStore((s) => s.logout)
    const isMobile = useIsMobile()
    const navigate = useNavigate()

    const [showSidebar, setShowSidebar] = useState(false)
    const [period,      setPeriod]      = useState<DashboardPeriod>('all')

    const { data, isLoading, refetch, isFetching } = useDashboard(period)

    return (
        <div
            className="flex h-screen overflow-hidden"
            style={{ background: 'var(--color-bg-primary)' }}
        >

            {!isMobile && (
                <aside className="w-72 flex-shrink-0">
                    <TraderSidebar />
                </aside>
            )}

            {isMobile && (
                <MobileDrawer
                    open={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    side="left"
                    title="Conversations"
                    width="85vw"
                >
                    <TraderSidebar />
                </MobileDrawer>
            )}

            <main className="flex-1 flex flex-col relative overflow-hidden">

                {/* HEADER */}
                <div
                    className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 gap-2"
                    style={{
                        background: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {isMobile && (
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                            style={{
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-border)',
                                color: 'var(--color-success)',
                            }}
                        >
                            <Menu size={18} />
                        </button>
                    )}

                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-border)',
                            }}
                        >
                            <BarChart3 size={16} style={{ color: 'var(--color-success)' }} />
                        </div>
                        <div className="min-w-0">
                            <h1
                                className="text-xs sm:text-sm font-semibold"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                Tableau de bord
                            </h1>
                            <p
                                className="text-[10px] sm:text-[11px] mt-0.5 truncate"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {user?.full_name ?? user?.username} · Vue d'ensemble
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ThemeToggle />

                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            title="Rafraîchir"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                            style={{
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-border)',
                                color: 'var(--color-success)',
                            }}
                        >
                            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={logout}
                            title="Déconnexion"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95"
                            style={{
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">

                    <PeriodFilter period={period} onChange={setPeriod} />

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--color-success)' }} />
                        </div>
                    ) : data ? (
                        <>
                            <StatsGrid totals={data.totals} />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="lg:col-span-2">
                                    <EvolutionChart data={data.daily_evolution} />
                                </div>
                                <div>
                                    <TopClientsCard clients={data.top_clients} />
                                </div>
                            </div>

                            <RecentActivityCard
                                activities={data.recent_activity}
                                onClick={(threadId) => navigate(`/trader/${threadId}`)}
                            />
                        </>
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </main>
        </div>
    )
}

/* ─── PERIOD FILTER ─── */
function PeriodFilter({
                          period, onChange,
                      }: { period: DashboardPeriod; onChange: (p: DashboardPeriod) => void }) {
    const isMobile = useIsMobile()

    return (
        <div
            className="p-1 rounded-xl flex gap-1 overflow-x-auto"
            style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-subtle)',
                scrollbarWidth: 'none',
            }}
        >
            {PERIODS.map((p) => {
                const active = p.key === period
                return (
                    <button
                        key={p.key}
                        onClick={() => onChange(p.key)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                        style={{
                            background: active
                                ? 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))'
                                : 'transparent',
                            border: active
                                ? '1px solid var(--color-success-border)'
                                : '1px solid transparent',
                            color: active ? '#fff' : 'var(--color-text-secondary)',
                            boxShadow: active ? 'var(--shadow-glow)' : 'none',
                            minHeight: 36,
                        }}
                    >
                        {isMobile ? p.mobileLabel : p.label}
                    </button>
                )
            })}
        </div>
    )
}

/* ─── STATS GRID ─── */
function StatsGrid({ totals }: { totals: DashboardTotals }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3">
            {STAT_CARDS.map((cfg) => (
                <StatCard key={cfg.key} config={cfg} value={totals[cfg.key]} />
            ))}
        </div>
    )
}

function StatCard({ config, value }: { config: StatCardConfig; value: number }) {
    const Icon = config.icon
    const colorVar  = `var(--color-${config.semantic})`
    const bgVar     = `var(--color-${config.semantic}-bg)`
    const borderVar = `var(--color-${config.semantic}-border)`

    return (
        <div
            className="p-3 sm:p-4 rounded-2xl transition-transform hover:scale-[1.02]"
            style={{
                background: 'var(--color-bg-card)',
                border: `1px solid ${borderVar}`,
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{ background: bgVar, border: `1px solid ${borderVar}` }}
                >
                    <Icon size={13} style={{ color: colorVar }} />
                </div>
                {value > 0 && (
                    <span
                        className="text-[8px] uppercase tracking-widest font-semibold"
                        style={{ color: colorVar, opacity: 0.7 }}
                    >
                        Actif
                    </span>
                )}
            </div>
            <div
                className="text-2xl sm:text-3xl font-bold font-mono-nums leading-none mb-1"
                style={{ color: colorVar }}
            >
                {value}
            </div>
            <div
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                {config.label}
            </div>
        </div>
    )
}

/* ─── EVOLUTION CHART ─── */
function EvolutionChart({ data }: { data: { date: string; label: string; count: number; accepted: number }[] }) {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    const colorTotal    = isDark ? '#4ade80' : '#16a34a'
    const colorAccepted = isDark ? '#fbbf24' : '#d97706'
    const gridColor     = isDark ? 'rgba(42, 128, 64, 0.2)' : 'rgba(42, 128, 64, 0.15)'
    const tickColor     = isDark ? '#a8c4aa' : '#3d5a42'
    const axisColor     = isDark ? 'rgba(42, 128, 64, 0.3)' : 'rgba(42, 128, 64, 0.2)'

    return (
        <div
            className="p-4 sm:p-5 rounded-2xl h-full"
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        <Activity size={14} style={{ color: 'var(--color-success)' }} />
                        Évolution sur 7 jours
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Tickets créés vs acceptés
                    </p>
                </div>
                <Legend />
            </div>

            <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor={colorTotal} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={colorTotal} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor={colorAccepted} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={colorAccepted} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis
                            dataKey="label"
                            stroke={tickColor}
                            tick={{ fill: tickColor, fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: axisColor }}
                        />
                        <YAxis
                            stroke={tickColor}
                            tick={{ fill: tickColor, fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: axisColor }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: isDark ? 'rgba(15, 58, 26, 0.95)' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(22, 163, 74, 0.3)'}`,
                                borderRadius: 8,
                                fontSize: 12,
                                color: isDark ? '#fff' : '#0a1f0e',
                            }}
                            labelStyle={{ color: tickColor, fontSize: 10, fontWeight: 600 }}
                            itemStyle={{ color: isDark ? '#fff' : '#0a1f0e' }}
                            cursor={{ stroke: colorTotal, strokeOpacity: 0.3, strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="Total"
                            stroke={colorTotal}
                            strokeWidth={2}
                            fill="url(#colorCount)"
                            dot={{ fill: colorTotal, r: 3 }}
                            activeDot={{ r: 5, fill: colorTotal, stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="accepted"
                            name="Acceptés"
                            stroke={colorAccepted}
                            strokeWidth={2}
                            fill="url(#colorAccepted)"
                            dot={{ fill: colorAccepted, r: 3 }}
                            activeDot={{ r: 5, fill: colorAccepted, stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function Legend() {
    return (
        <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
                <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--color-success)' }}
                />
                <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Total
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--color-warning)' }}
                />
                <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                    Acceptés
                </span>
            </div>
        </div>
    )
}

/* ─── TOP CLIENTS ─── */
function TopClientsCard({ clients }: { clients: DashboardTopClient[] }) {
    const maxTickets = Math.max(...clients.map((c) => c.tickets), 1)

    return (
        <div
            className="p-4 sm:p-5 rounded-2xl h-full"
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        <Users size={14} style={{ color: 'var(--color-success)' }} />
                        Top clients
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Par volume de tickets
                    </p>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="py-8 text-center">
                    <Users
                        size={24}
                        className="mx-auto mb-2 opacity-30"
                        style={{ color: 'var(--color-text-secondary)' }}
                    />
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Aucun ticket
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {clients.map((c, idx) => {
                        const pct  = (c.tickets / maxTickets) * 100
                        const name = c.client_name ?? c.username ?? `Client #${c.client_id}`

                        return (
                            <div key={c.client_id}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                                            style={{
                                                background: idx === 0
                                                    ? 'var(--color-warning)'
                                                    : 'var(--color-success-bg)',
                                                color: idx === 0
                                                    ? '#0a1f0e'
                                                    : 'var(--color-success)',
                                            }}
                                        >
                                            {idx + 1}
                                        </span>
                                        <span
                                            className="text-xs font-medium truncate"
                                            style={{ color: 'var(--color-text-primary)' }}
                                        >
                                            {name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                                            {c.success_rate}%
                                        </span>
                                        <span
                                            className="text-xs font-mono-nums font-bold"
                                            style={{ color: 'var(--color-success)' }}
                                        >
                                            {c.tickets}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ background: 'var(--color-bg-tertiary)' }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pct}%`,
                                            background: 'linear-gradient(90deg, var(--color-accent-secondary), var(--color-success))',
                                            boxShadow: 'var(--shadow-glow)',
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ─── RECENT ACTIVITY ─── */
/* ✅ STATUS_CONFIG complété avec les 4 nouveaux statuts */
const STATUS_CONFIG: Record<OrderStatus, { icon: LucideIcon; semantic: string; label: string }> = {
    PROPOSED:            { icon: Clock,          semantic: 'warning', label: 'Proposé' },
    ACCEPTED_BY_CLIENT:  { icon: CheckCircle2,   semantic: 'success', label: 'Accepté' },
    DECLINED_BY_CLIENT:  { icon: XCircle,        semantic: 'danger',  label: 'Refusé' },
    CONFIRMED_BY_BRANCH: { icon: ClipboardCheck, semantic: 'info',    label: 'Pris en charge' },
    COMPLETED:           { icon: Award,          semantic: 'success', label: 'Finalisé' },
    EXPIRED:             { icon: Hourglass,      semantic: 'neutral', label: 'Expiré' },
    CANCELLED:           { icon: XCircle,        semantic: 'danger',  label: 'Annulé' },

    /* ─── ✅ NEW : workflow client-initiated ─── */
    PROPOSED_BY_CLIENT:  { icon: UserPlus,       semantic: 'warning', label: 'Demande client' },
    COUNTERED_BY_TRADER: { icon: Repeat,         semantic: 'info',    label: 'Contre-proposition' },
    ACCEPTED_BY_TRADER:  { icon: CheckCircle2,   semantic: 'success', label: 'Accepté trader' },
    DECLINED_BY_TRADER:  { icon: XCircle,        semantic: 'danger',  label: 'Refusé trader' },
}

function timeAgo(iso: string | null): string {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const min  = Math.floor(diff / 60_000)
    if (min < 1)   return "à l'instant"
    if (min < 60)  return `il y a ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24)    return `il y a ${h}h`
    const d = Math.floor(h / 24)
    if (d < 30)    return `il y a ${d}j`
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function RecentActivityCard({
                                activities, onClick,
                            }: {
    activities: DashboardRecentActivity[]
    onClick:    (threadId: number) => void
}) {
    return (
        <div
            className="p-4 sm:p-5 rounded-2xl"
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3
                        className="text-base font-semibold flex items-center gap-2"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        <Activity size={16} style={{ color: 'var(--color-success)' }} />
                        Activité récente
                    </h3>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        10 dernières actions
                    </p>
                </div>
            </div>

            {activities.length === 0 ? (
                <div className="py-8 text-center">
                    <Activity
                        size={24}
                        className="mx-auto mb-2 opacity-30"
                        style={{ color: 'var(--color-text-secondary)' }}
                    />
                    <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Aucune activité
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {activities.map((a) => {
                        const cfg  = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.PROPOSED
                        const Icon = cfg.icon
                        const name = a.client_name ?? a.username ?? `Client #${a.client_id}`
                        const isBuy = a.operation === 'BUY'

                        const colorVar  = `var(--color-${cfg.semantic})`
                        const bgVar     = `var(--color-${cfg.semantic}-bg)`
                        const borderVar = `var(--color-${cfg.semantic}-border)`

                        return (
                            <div
                                key={a.order_id}
                                onClick={() => onClick(a.thread_id)}
                                className="px-3.5 py-3 rounded-xl flex items-center gap-3.5 cursor-pointer transition-all active:scale-[0.99]"
                                style={{
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border-subtle)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--color-bg-card-hover)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: bgVar,
                                        border: `1px solid ${borderVar}`,
                                    }}
                                >
                                    <Icon size={16} style={{ color: colorVar }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className="font-mono-nums text-[14px] font-bold"
                                            style={{ color: 'var(--color-text-primary)' }}
                                        >
                                            {a.ref_ticket}
                                        </span>
                                        <span
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded"
                                            style={{
                                                background: bgVar,
                                                color: colorVar,
                                                border: `1px solid ${borderVar}`,
                                            }}
                                        >
                                            {cfg.label}
                                        </span>
                                        <span
                                            className="text-[12px] font-bold flex items-center gap-1"
                                            style={{
                                                color: isBuy ? 'var(--color-success)' : 'var(--color-danger)',
                                            }}
                                        >
                                            {isBuy ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                            {a.operation === 'BUY' ? 'Achat' : 'Vente'} {a.currency}
                                        </span>
                                    </div>
                                    <div
                                        className="text-[12px] mt-1 truncate"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        <span
                                            className="font-semibold"
                                            style={{ color: 'var(--color-text-primary)' }}
                                        >
                                            {name}
                                        </span>
                                        <span className="mx-1.5 opacity-40">·</span>
                                        <span className="font-mono-nums">
                                            {a.amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} {a.currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    <span
                                        className="text-[11px] font-mono-nums hidden sm:inline"
                                        style={{ color: 'var(--color-text-tertiary)' }}
                                    >
                                        {timeAgo(a.updated_at)}
                                    </span>
                                    <ArrowRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                    background: 'var(--color-success-bg)',
                    border: '1px solid var(--color-success-border)',
                }}
            >
                <BarChart3 size={28} style={{ color: 'var(--color-success)' }} />
            </div>
            <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                Aucune donnée disponible
            </p>
            <p
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-tertiary)' }}
            >
                Sélectionnez une autre période ou créez votre premier ticket
            </p>
        </div>
    )
}