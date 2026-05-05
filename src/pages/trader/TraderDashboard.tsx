import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LogOut, Menu, BarChart3, Clock, CheckCircle2, XCircle,
    ClipboardCheck, Award, Hourglass, TrendingUp, TrendingDown,
    Users, Activity, RefreshCw, ArrowRight,
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
import { MobileDrawer }  from '@/components/ui/MobileDrawer'
import type {
    DashboardPeriod, DashboardTopClient, DashboardRecentActivity, DashboardTotals,
} from '@/types/dashboard.types'
import type { OrderStatus } from '@/types/ticket.types'

type StatKey = keyof DashboardTotals

interface StatCardConfig {
    key:    StatKey
    label:  string
    icon:   LucideIcon
    color:  string
    bg:     string
    border: string
}

const STAT_CARDS: StatCardConfig[] = [
    { key: 'total',     label: 'Total',          icon: BarChart3,      color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)',  border: 'rgba(74, 222, 128, 0.3)' },
    { key: 'proposed',  label: 'En cours',       icon: Clock,          color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)',  border: 'rgba(251, 191, 36, 0.3)' },
    { key: 'accepted',  label: 'Acceptés',       icon: CheckCircle2,   color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.35)' },
    { key: 'declined',  label: 'Refusés',        icon: XCircle,        color: '#fb7185', bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.3)' },
    { key: 'confirmed', label: 'Pris en charge', icon: ClipboardCheck, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)',  border: 'rgba(96, 165, 250, 0.3)' },
    { key: 'completed', label: 'Finalisés',      icon: Award,          color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.35)' },
    { key: 'expired',   label: 'Expirés',        icon: Hourglass,      color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.25)' },
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
        <div className="flex h-screen overflow-hidden" style={{ background: '#070d09' }}>

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

                <div
                    className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 gap-2"
                    style={{
                        background: 'rgba(15, 58, 26, 0.8)',
                        borderColor: 'rgba(42, 128, 64, 0.3)',
                    }}
                >
                    {isMobile && (
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                            style={{
                                background: 'rgba(74, 222, 128, 0.12)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                color: '#4ade80',
                            }}
                        >
                            <Menu size={18} />
                        </button>
                    )}

                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'rgba(74, 222, 128, 0.15)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                            }}
                        >
                            <BarChart3 size={16} style={{ color: '#4ade80' }} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xs sm:text-sm font-semibold text-white">Tableau de bord</h1>
                            <p className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: '#a8c4aa' }}>
                                {user?.full_name ?? user?.username} · Vue d'ensemble
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            title="Rafraîchir"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                            style={{
                                background: 'rgba(74, 222, 128, 0.08)',
                                border: '1px solid rgba(74, 222, 128, 0.25)',
                                color: '#4ade80',
                            }}
                        >
                            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={logout}
                            title="Déconnexion"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95"
                            style={{
                                background: 'rgba(15, 58, 26, 0.4)',
                                border: '1px solid rgba(42, 128, 64, 0.3)',
                                color: '#a8c4aa',
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
                            <RefreshCw size={20} className="animate-spin" style={{ color: '#4ade80' }} />
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

function PeriodFilter({
                          period, onChange,
                      }: { period: DashboardPeriod; onChange: (p: DashboardPeriod) => void }) {
    const isMobile = useIsMobile()

    return (
        <div
            className="p-1 rounded-xl flex gap-1 overflow-x-auto"
            style={{
                background: 'rgba(15, 58, 26, 0.4)',
                border: '1px solid rgba(42, 128, 64, 0.25)',
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
                            background: active ? 'linear-gradient(135deg, #2a8040, #1a5c2a)' : 'transparent',
                            border: active ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid transparent',
                            color: active ? '#fff' : '#a8c4aa',
                            boxShadow: active ? '0 4px 12px rgba(26, 92, 42, 0.3)' : 'none',
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

    return (
        <div
            className="p-3 sm:p-4 rounded-2xl transition-transform hover:scale-[1.02]"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 58, 26, 0.6), rgba(10, 31, 14, 0.6))',
                border: `1px solid ${config.border}`,
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{ background: config.bg, border: `1px solid ${config.border}` }}
                >
                    <Icon size={13} style={{ color: config.color }} />
                </div>
                {value > 0 && (
                    <span
                        className="text-[8px] uppercase tracking-widest font-semibold"
                        style={{ color: config.color, opacity: 0.7 }}
                    >
                        Actif
                    </span>
                )}
            </div>
            <div
                className="text-2xl sm:text-3xl font-bold font-mono-nums leading-none mb-1"
                style={{ color: config.color }}
            >
                {value}
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a8c4aa' }}>
                {config.label}
            </div>
        </div>
    )
}

function EvolutionChart({ data }: { data: { date: string; label: string; count: number; accepted: number }[] }) {
    return (
        <div
            className="p-4 sm:p-5 rounded-2xl h-full"
            style={{
                background: 'linear-gradient(180deg, rgba(15, 58, 26, 0.5), rgba(10, 31, 14, 0.5))',
                border: '1px solid rgba(42, 128, 64, 0.3)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Activity size={14} style={{ color: '#4ade80' }} />
                        Évolution sur 7 jours
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: '#a8c4aa' }}>
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
                                <stop offset="0%"   stopColor="#4ade80" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#fbbf24" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(42, 128, 64, 0.2)" />
                        <XAxis
                            dataKey="label"
                            stroke="#5a8060"
                            tick={{ fill: '#a8c4aa', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(42, 128, 64, 0.3)' }}
                        />
                        <YAxis
                            stroke="#5a8060"
                            tick={{ fill: '#a8c4aa', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(42, 128, 64, 0.3)' }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15, 58, 26, 0.95)',
                                border: '1px solid rgba(74, 222, 128, 0.4)',
                                borderRadius: 8,
                                fontSize: 12,
                            }}
                            labelStyle={{ color: '#a8c4aa', fontSize: 10, fontWeight: 600 }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ stroke: 'rgba(74, 222, 128, 0.3)', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="Total"
                            stroke="#4ade80"
                            strokeWidth={2}
                            fill="url(#colorCount)"
                            dot={{ fill: '#4ade80', r: 3 }}
                            activeDot={{ r: 5, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="accepted"
                            name="Acceptés"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            fill="url(#colorAccepted)"
                            dot={{ fill: '#fbbf24', r: 3 }}
                            activeDot={{ r: 5, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
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
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#4ade80' }} />
                <span className="text-[10px]" style={{ color: '#a8c4aa' }}>Total</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#fbbf24' }} />
                <span className="text-[10px]" style={{ color: '#a8c4aa' }}>Acceptés</span>
            </div>
        </div>
    )
}

function TopClientsCard({ clients }: { clients: DashboardTopClient[] }) {
    const maxTickets = Math.max(...clients.map((c) => c.tickets), 1)

    return (
        <div
            className="p-4 sm:p-5 rounded-2xl h-full"
            style={{
                background: 'linear-gradient(180deg, rgba(15, 58, 26, 0.5), rgba(10, 31, 14, 0.5))',
                border: '1px solid rgba(42, 128, 64, 0.3)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Users size={14} style={{ color: '#4ade80' }} />
                        Top clients
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: '#a8c4aa' }}>
                        Par volume de tickets
                    </p>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="py-8 text-center">
                    <Users size={24} className="mx-auto mb-2 opacity-30" style={{ color: '#a8c4aa' }} />
                    <p className="text-xs" style={{ color: '#5a8060' }}>Aucun ticket</p>
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
                                                background: idx === 0 ? '#fbbf24' : 'rgba(74, 222, 128, 0.2)',
                                                color: idx === 0 ? '#0a1f0e' : '#4ade80',
                                            }}
                                        >
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs font-medium text-white truncate">{name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-[10px]" style={{ color: '#a8c4aa' }}>
                                            {c.success_rate}%
                                        </span>
                                        <span className="text-xs font-mono-nums font-bold" style={{ color: '#4ade80' }}>
                                            {c.tickets}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pct}%`,
                                            background: 'linear-gradient(90deg, #2a8040, #4ade80)',
                                            boxShadow: '0 0 6px rgba(74, 222, 128, 0.4)',
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

const STATUS_ICONS: Record<OrderStatus, { icon: LucideIcon; color: string; label: string }> = {
    PROPOSED:            { icon: Clock,          color: '#fbbf24', label: 'Proposé' },
    ACCEPTED_BY_CLIENT:  { icon: CheckCircle2,   color: '#4ade80', label: 'Accepté' },
    DECLINED_BY_CLIENT:  { icon: XCircle,        color: '#fb7185', label: 'Refusé' },
    CONFIRMED_BY_BRANCH: { icon: ClipboardCheck, color: '#60a5fa', label: 'Pris en charge' },
    COMPLETED:           { icon: Award,          color: '#34d399', label: 'Finalisé' },
    EXPIRED:             { icon: Hourglass,      color: '#94a3b8', label: 'Expiré' },
    CANCELLED:           { icon: XCircle,        color: '#fb7185', label: 'Annulé' },
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

/* ═══════════════════════════════════════════════════════════════════════ */
/*    ✅ ACTIVITÉ RÉCENTE — refondue avec écriture plus grande              */
/* ═══════════════════════════════════════════════════════════════════════ */

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
                background: 'linear-gradient(180deg, rgba(15, 58, 26, 0.5), rgba(10, 31, 14, 0.5))',
                border: '1px solid rgba(42, 128, 64, 0.3)',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <Activity size={16} style={{ color: '#4ade80' }} />
                        Activité récente
                    </h3>
                    <p className="text-[12px] mt-0.5" style={{ color: '#a8c4aa' }}>
                        10 dernières actions
                    </p>
                </div>
            </div>

            {activities.length === 0 ? (
                <div className="py-8 text-center">
                    <Activity size={24} className="mx-auto mb-2 opacity-30" style={{ color: '#a8c4aa' }} />
                    <p className="text-xs" style={{ color: '#5a8060' }}>Aucune activité</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {activities.map((a) => {
                        const cfg  = STATUS_ICONS[a.status] ?? STATUS_ICONS.PROPOSED
                        const Icon = cfg.icon
                        const name = a.client_name ?? a.username ?? `Client #${a.client_id}`
                        const isBuy = a.operation === 'BUY'

                        return (
                            <div
                                key={a.order_id}
                                onClick={() => onClick(a.thread_id)}
                                className="px-3.5 py-3 rounded-xl flex items-center gap-3.5 cursor-pointer transition-all hover:bg-white/5 active:scale-[0.99]"
                                style={{
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    border: '1px solid rgba(42, 128, 64, 0.15)',
                                }}
                            >
                                {/* Icône statut — agrandie */}
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: `${cfg.color}15`,
                                        border: `1px solid ${cfg.color}30`,
                                    }}
                                >
                                    <Icon size={16} style={{ color: cfg.color }} />
                                </div>

                                {/* Contenu */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono-nums text-[14px] font-bold text-white">
                                            {a.ref_ticket}
                                        </span>
                                        <span
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded"
                                            style={{
                                                background: `${cfg.color}15`,
                                                color: cfg.color,
                                                border: `1px solid ${cfg.color}30`,
                                            }}
                                        >
                                            {cfg.label}
                                        </span>
                                        <span
                                            className="text-[12px] font-bold flex items-center gap-1"
                                            style={{ color: isBuy ? '#4ade80' : '#fb7185' }}
                                        >
                                            {isBuy ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                            {a.operation === 'BUY' ? 'Achat' : 'Vente'} {a.currency}
                                        </span>
                                    </div>
                                    <div className="text-[12px] mt-1 truncate" style={{ color: '#a8c4aa' }}>
                                        <span className="font-semibold text-white">{name}</span>
                                        <span className="mx-1.5 opacity-40">·</span>
                                        <span className="font-mono-nums">
                                            {a.amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} {a.currency}
                                        </span>
                                    </div>
                                </div>

                                {/* Time + arrow */}
                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    <span className="text-[11px] font-mono-nums hidden sm:inline" style={{ color: '#5a8060' }}>
                                        {timeAgo(a.updated_at)}
                                    </span>
                                    <ArrowRight size={14} style={{ color: '#5a8060' }} />
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
                    background: 'rgba(42, 128, 64, 0.15)',
                    border: '1px solid rgba(74, 222, 128, 0.25)',
                }}
            >
                <BarChart3 size={28} style={{ color: '#4ade80' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#a8c4aa' }}>
                Aucune donnée disponible
            </p>
            <p className="text-xs mt-1" style={{ color: '#5a8060' }}>
                Sélectionnez une autre période ou créez votre premier ticket
            </p>
        </div>
    )
}