import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
    Shield, Users, TrendingUp, LogOut, Plus, Search, Save,
    X, Eye, EyeOff, RefreshCw, KeyRound,
    Edit2, Check, AlertCircle, CheckCircle2, Lock,
    ArrowUpRight, ArrowDownRight,
    type LucideIcon,
} from 'lucide-react'
import { AxiosError } from 'axios'

import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'
import { useIsMobile }  from '@/hooks/useIsMobile'
import { queryClient }  from '@/lib/queryClient'

/* ════════════════════════════════════════════════════════════════════════ */
/*                              TYPES                                       */
/* ════════════════════════════════════════════════════════════════════════ */

interface AdminUser {
    user_id: number
    username: string
    full_name: string | null
    email: string | null
    role: 'CLIENT' | 'TRADER' | 'AGENCE' | 'ADMIN'
    is_active: number
    is_online: number
    last_seen_at: string | null
    last_login_at: string | null
}

interface Rate {
    code: string
    buy: number
    sell: number
    flag?: string | null
    label?: string | null
}

type Tab = 'users' | 'rates'

interface ApiErrorDetail {
    msg?: string
    type?: string
    loc?: (string | number)[]
}

interface ApiErrorPayload {
    detail?: string | ApiErrorDetail[]
}

function extractApiErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof AxiosError) {
        const detail = (err.response?.data as ApiErrorPayload | undefined)?.detail
        if (typeof detail === 'string') return detail
        if (Array.isArray(detail) && detail.length > 0) {
            const first = detail[0]
            if (first?.msg) return first.msg.replace('Value error, ', '')
        }
        return err.message || fallback
    }
    if (err instanceof Error) return err.message
    return fallback
}

const ROLE_COLORS: Record<string, string> = {
    CLIENT: '#a8c4aa',
    TRADER: '#fbbf24',
    AGENCE: '#60a5fa',
    ADMIN:  '#fb7185',
}

/* ─── Labels devises pour cards ────────────────────────────────────── */
const CURRENCY_LABELS: Record<string, string> = {
    EUR: 'Euro',
    USD: 'Dollar US',
    GBP: 'Livre Sterling',
    CHF: 'Franc Suisse',
    CAD: 'Dollar Canadien',
    AED: 'Dirham Émirien',
    SAR: 'Riyal Saoudien',
    QAR: 'Riyal Qatari',
    KWD: 'Dinar Koweïtien',
    LYD: 'Dinar Libyen',
    JPY: 'Yen Japonais',
    BHD: 'Dinar Bahreïni',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
    username?: string
    email?: string
    password?: string
}

function validateUserForm(form: { username: string; email: string; password: string }): FormErrors {
    const errors: FormErrors = {}
    if (!form.username.trim()) errors.username = 'Identifiant requis'
    else if (form.username.length < 3) errors.username = 'Au moins 3 caractères'
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.username)) errors.username = 'Lettres, chiffres, ., _, - uniquement'
    if (form.email && !EMAIL_REGEX.test(form.email)) errors.email = 'Format email invalide (ex: nom@domaine.tn)'
    if (!form.password) errors.password = 'Mot de passe requis'
    else if (form.password.length < 6) errors.password = 'Au moins 6 caractères'
    return errors
}

/* ════════════════════════════════════════════════════════════════════════ */
/*                            ADMIN PAGE                                    */
/* ════════════════════════════════════════════════════════════════════════ */

export default function AdminPage() {
    const user   = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)
    const [tab, setTab] = useState<Tab>('users')

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#070d09' }}>

            <header
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0"
                style={{
                    background: 'rgba(15, 58, 26, 0.7)',
                    borderColor: 'rgba(42, 128, 64, 0.3)',
                }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: 'rgba(74, 222, 128, 0.15)',
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                        }}
                    >
                        <Shield size={16} style={{ color: '#4ade80' }} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xs sm:text-sm font-semibold text-white">Console Administration</h1>
                        <p className="text-[10px] sm:text-[11px] mt-0.5 truncate" style={{ color: '#a8c4aa' }}>
                            {user?.full_name ?? user?.username} · Accès complet
                        </p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    title="Déconnexion"
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-95"
                    style={{
                        background: 'rgba(15, 58, 26, 0.4)',
                        border: '1px solid rgba(42, 128, 64, 0.3)',
                        color: '#a8c4aa',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(200, 16, 46, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(200, 16, 46, 0.4)'
                        e.currentTarget.style.color = '#fb7185'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 58, 26, 0.4)'
                        e.currentTarget.style.borderColor = 'rgba(42, 128, 64, 0.3)'
                        e.currentTarget.style.color = '#a8c4aa'
                    }}
                >
                    <LogOut size={14} />
                </button>
            </header>

            <div
                className="px-4 sm:px-6 border-b flex gap-1 flex-shrink-0"
                style={{
                    background: 'rgba(15, 58, 26, 0.4)',
                    borderColor: 'rgba(42, 128, 64, 0.2)',
                }}
            >
                <TabButton icon={Users}      label="Utilisateurs" active={tab === 'users'} onClick={() => setTab('users')} />
                <TabButton icon={TrendingUp} label="Taux"         active={tab === 'rates'} onClick={() => setTab('rates')} />
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                {tab === 'users' && <UsersTab />}
                {tab === 'rates' && <RatesTab />}
            </main>
        </div>
    )
}

interface TabButtonProps {
    icon: LucideIcon
    label: string
    active: boolean
    onClick: () => void
}

function TabButton({ icon: Icon, label, active, onClick }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-semibold transition-all relative"
            style={{ color: active ? '#4ade80' : '#a8c4aa' }}
        >
            <Icon size={14} />
            <span>{label}</span>
            {active && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}
                />
            )}
        </button>
    )
}

/* ═══ ONGLET UTILISATEURS — INCHANGÉ ═══════════════════════════════════ */
function UsersTab() {
    const [search, setSearch]         = useState('')
    const [filterRole, setFilterRole] = useState<string>('ALL')
    const [showCreate, setShowCreate] = useState(false)
    const isMobile = useIsMobile()

    const { data, isLoading, error, refetch } = useQuery<AdminUser[]>({
        queryKey: ['admin-users'],
        queryFn:  async () => {
            const r = await api.get<AdminUser[]>('/users/')
            return r.data ?? []
        },
        refetchInterval: 5_000,
    })

    const users: AdminUser[] = Array.isArray(data) ? data : []

    const stats = {
        total:   users.length,
        online:  users.filter((u) => Number(u.is_online) === 1).length,
        clients: users.filter((u) => u.role === 'CLIENT').length,
        traders: users.filter((u) => u.role === 'TRADER').length,
        agence:  users.filter((u) => u.role === 'AGENCE').length,
    }

    const filtered = users.filter((u) => {
        if (filterRole !== 'ALL' && u.role !== filterRole) return false
        if (!search) return true
        const q = search.toLowerCase()
        return (
            u.username.toLowerCase().includes(q) ||
            (u.full_name?.toLowerCase().includes(q) ?? false) ||
            (u.email?.toLowerCase().includes(q) ?? false)
        )
    })

    if (error) {
        return (
            <ErrorState
                message="Erreur lors du chargement des utilisateurs"
                detail={extractApiErrorMessage(error, 'Erreur inconnue')}
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                <StatCard label="Total"    value={stats.total}    color="#4ade80" />
                <StatCard label="En ligne" value={stats.online}   color="#4ade80" pulse />
                <StatCard label="Clients"  value={stats.clients}  color="#a8c4aa" />
                <StatCard label="Traders"  value={stats.traders}  color="#fbbf24" />
                <StatCard label="Agences"  value={stats.agence}   color="#60a5fa" />
            </div>

            <div
                className="p-3 sm:p-4 rounded-2xl flex flex-col gap-3"
                style={{
                    background: 'rgba(15, 58, 26, 0.4)',
                    border: '1px solid rgba(42, 128, 64, 0.3)',
                }}
            >
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a8060' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher utilisateur, email..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg focus:outline-none transition-colors"
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            fontSize: '16px',
                        }}
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="flex-1 px-3 py-2.5 text-sm rounded-lg focus:outline-none"
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            fontSize: '16px',
                        }}
                    >
                        <option value="ALL">Tous les rôles</option>
                        <option value="CLIENT">Clients</option>
                        <option value="TRADER">Traders</option>
                        <option value="AGENCE">Agences</option>
                        <option value="ADMIN">Admins</option>
                    </select>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 min-h-[44px]"
                        style={{
                            background: 'linear-gradient(135deg, #2a8040, #1a5c2a)',
                            border: '1px solid rgba(74, 222, 128, 0.4)',
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(26, 92, 42, 0.3)',
                        }}
                    >
                        <Plus size={14} />
                        {!isMobile && 'Nouvel utilisateur'}
                        {isMobile && 'Nouveau'}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <RefreshCw size={20} className="animate-spin" style={{ color: '#4ade80' }} />
                </div>
            )}

            {!isLoading && (
                isMobile
                    ? <UserCards users={filtered} />
                    : <UsersTable users={filtered} />
            )}

            {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
        </div>
    )
}

function StatCard({ label, value, color, pulse }: { label: string; value: number; color: string; pulse?: boolean }) {
    return (
        <div
            className="p-3 sm:p-4 rounded-2xl"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 58, 26, 0.6), rgba(10, 31, 14, 0.6))',
                border: '1px solid rgba(42, 128, 64, 0.3)',
            }}
        >
            <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: '#a8c4aa' }}>
                    {label}
                </span>
                {pulse && value > 0 && (
                    <span
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                        style={{ background: color, boxShadow: `0 0 8px ${color}`, animation: 'pulse 2s infinite' }}
                    />
                )}
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono-nums" style={{ color }}>
                {value}
            </div>
        </div>
    )
}

function ErrorState({ message, detail, onRetry }: { message: string; detail?: string; onRetry: () => void }) {
    return (
        <div className="max-w-2xl mx-auto">
            <div
                className="p-6 rounded-2xl text-center"
                style={{
                    background: 'rgba(200, 16, 46, 0.1)',
                    border: '1px solid rgba(251, 113, 133, 0.3)',
                }}
            >
                <AlertCircle size={28} style={{ color: '#fb7185' }} className="mx-auto mb-3" />
                <p className="text-sm font-semibold" style={{ color: '#fb7185' }}>{message}</p>
                {detail && <p className="text-xs mt-1" style={{ color: '#a8c4aa' }}>{detail}</p>}
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 mx-auto"
                    style={{
                        background: 'rgba(42, 128, 64, 0.2)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        color: '#4ade80',
                    }}
                >
                    <RefreshCw size={12} />
                    Réessayer
                </button>
            </div>
        </div>
    )
}

/* ═══ TABLE & CARDS USERS — INCHANGÉS (mêmes versions qu'avant) ═══════ */

function UsersTable({ users }: { users: AdminUser[] }) {
    if (users.length === 0) return <EmptyUsers />
    return (
        <div className="rounded-2xl overflow-hidden"
             style={{ background: 'rgba(15, 58, 26, 0.3)', border: '1px solid rgba(42, 128, 64, 0.3)' }}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr style={{ background: 'rgba(26, 92, 42, 0.3)' }}>
                        <Th>ID</Th><Th>Identifiant</Th><Th>Nom complet</Th><Th>Email</Th>
                        <Th>Rôle</Th><Th align="center">Présence</Th><Th>Statut</Th>
                        <Th>Dernière connexion</Th><Th align="right">Actions</Th>
                    </tr>
                    </thead>
                    <tbody>{users.map((u) => <UserRow key={u.user_id} user={u} />)}</tbody>
                </table>
            </div>
        </div>
    )
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' | 'left' | 'center' }) {
    return (
        <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: '#a8c4aa', textAlign: align ?? 'left', borderBottom: '1px solid rgba(42, 128, 64, 0.25)' }}>
            {children}
        </th>
    )
}

function Td({ children, align }: { children: React.ReactNode; align?: 'right' | 'left' | 'center' }) {
    return <td className="px-4 py-3" style={{ textAlign: align ?? 'left' }}>{children}</td>
}

function UserRow({ user }: { user: AdminUser }) {
    const [showResetPwd, setShowResetPwd] = useState(false)
    const color    = ROLE_COLORS[user.role] ?? '#a8c4aa'
    const isOnline = Number(user.is_online) === 1
    return (
        <>
            <tr style={{ borderBottom: '1px solid rgba(42, 128, 64, 0.15)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26, 92, 42, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <Td><span className="font-mono-nums text-[11px]" style={{ color: '#5a8060' }}>#{user.user_id}</span></Td>
                <Td><span className="font-medium text-white">{user.username}</span></Td>
                <Td><span style={{ color: '#a8c4aa' }}>{user.full_name ?? '—'}</span></Td>
                <Td><span className="text-xs" style={{ color: '#a8c4aa' }}>{user.email ?? '—'}</span></Td>
                <Td><span className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{user.role}</span></Td>
                <Td align="center"><PresencePill online={isOnline} /></Td>
                <Td>{user.is_active
                    ? <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#4ade80' }}><CheckCircle2 size={11} /> Actif</span>
                    : <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#fb7185' }}><X size={11} /> Désactivé</span>}</Td>
                <Td><span className="text-[11px] font-mono-nums" style={{ color: '#a8c4aa' }}>
                    {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
                        : 'Jamais'}</span></Td>
                <Td align="right">
                    <button title="Réinitialiser mot de passe" onClick={() => setShowResetPwd(true)}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                            style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#fbbf24' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)'; e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}>
                        <KeyRound size={13} />
                    </button>
                </Td>
            </tr>
            {showResetPwd && <ResetPasswordModal user={user} onClose={() => setShowResetPwd(false)} />}
        </>
    )
}

function UserCards({ users }: { users: AdminUser[] }) {
    if (users.length === 0) return <EmptyUsers />
    return <div className="space-y-3">{users.map((u) => <UserCard key={u.user_id} user={u} />)}</div>
}

function UserCard({ user }: { user: AdminUser }) {
    const [showResetPwd, setShowResetPwd] = useState(false)
    const color    = ROLE_COLORS[user.role] ?? '#a8c4aa'
    const isOnline = Number(user.is_online) === 1
    return (
        <>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(15, 58, 26, 0.3)', border: '1px solid rgba(42, 128, 64, 0.25)' }}>
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                         style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                        {user.username[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white truncate">{user.full_name ?? user.username}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                                  style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{user.role}</span>
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: '#a8c4aa' }}>
                            @{user.username}<span className="mx-1.5 opacity-30">·</span>
                            <span className="font-mono-nums" style={{ color: '#5a8060' }}>#{user.user_id}</span>
                        </div>
                    </div>
                    <PresencePill online={isOnline} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="px-2.5 py-2 rounded-lg truncate"
                         style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(42, 128, 64, 0.15)', color: '#a8c4aa' }}>
                        <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#5a8060' }}>Email</div>
                        <div className="truncate">{user.email ?? '—'}</div>
                    </div>
                    <div className="px-2.5 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(42, 128, 64, 0.15)' }}>
                        <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: '#5a8060' }}>Statut</div>
                        {user.is_active
                            ? <span className="inline-flex items-center gap-1" style={{ color: '#4ade80' }}><CheckCircle2 size={10} /> Actif</span>
                            : <span className="inline-flex items-center gap-1" style={{ color: '#fb7185' }}><X size={10} /> Désactivé</span>}
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] font-mono-nums" style={{ color: '#5a8060' }}>
                        {user.last_login_at
                            ? `Dernière co : ${new Date(user.last_login_at).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })}`
                            : 'Jamais connecté'}
                    </div>
                    <button title="Réinitialiser mot de passe" onClick={() => setShowResetPwd(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                            style={{ background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24' }}>
                        <KeyRound size={12} />Réinit. mdp
                    </button>
                </div>
            </div>
            {showResetPwd && <ResetPasswordModal user={user} onClose={() => setShowResetPwd(false)} />}
        </>
    )
}

function PresencePill({ online }: { online: boolean }) {
    return online ? (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full flex-shrink-0"
             style={{ background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 1.5s infinite' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#4ade80' }}>En ligne</span>
        </div>
    ) : (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full flex-shrink-0"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#5a8060' }} />
            <span className="text-[10px]" style={{ color: '#5a8060' }}>Hors ligne</span>
        </div>
    )
}

function EmptyUsers() {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                 style={{ background: 'rgba(42, 128, 64, 0.15)', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
                <Users size={28} style={{ color: '#4ade80' }} />
            </div>
            <p className="text-sm" style={{ color: '#a8c4aa' }}>Aucun utilisateur trouvé</p>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*    ✅ ONGLET TAUX — REFONDU avec cards salle des marchés              */
/* ═══════════════════════════════════════════════════════════════════════ */

function FlagImg({ code }: { code: string }) {
    const [err, setErr] = useState(false)
    if (err) return <span className="text-2xl">🏳️</span>
    return (
        <img
            src={`/flags/${code}.png`}
            alt={code}
            onError={() => setErr(true)}
            className="w-12 h-8 object-cover rounded shadow-sm"
        />
    )
}

function RatesTab() {
    const [authModal, setAuthModal] = useState<{ rate: Rate; buy: number; sell: number } | null>(null)
    const [search, setSearch] = useState('')

    const { data, isLoading, error, refetch } = useQuery<{ rates: Rate[] }>({
        queryKey: ['admin-rates'],
        queryFn:  async () => (await api.get('/rates/all')).data,
        refetchInterval: 10_000,
    })

    const rates: Rate[] = Array.isArray(data?.rates) ? data!.rates : []

    const filtered = useMemo(() => {
        if (!search.trim()) return rates
        const q = search.toLowerCase().trim()
        return rates.filter((r) =>
            r.code.toLowerCase().includes(q) ||
            (CURRENCY_LABELS[r.code] ?? '').toLowerCase().includes(q)
        )
    }, [rates, search])

    if (error) {
        return (
            <ErrorState
                message="Erreur lors du chargement des taux"
                detail={extractApiErrorMessage(error, 'Erreur inconnue')}
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

            {/* Header avec stats globales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <RateStatCard
                    label="Devises"
                    value={rates.length}
                    icon={TrendingUp}
                    color="#4ade80"
                />
                <RateStatCard
                    label="Spread moyen"
                    value={rates.length > 0
                        ? `${(rates.reduce((s, r) => s + ((r.sell - r.buy) / r.buy) * 100, 0) / rates.length).toFixed(2)}%`
                        : '—'}
                    icon={ArrowUpRight}
                    color="#fbbf24"
                />
                <RateStatCard
                    label="Achat moyen"
                    value={rates.length > 0
                        ? (rates.reduce((s, r) => s + r.buy, 0) / rates.length).toFixed(3)
                        : '—'}
                    icon={ArrowDownRight}
                    color="#4ade80"
                />
                <RateStatCard
                    label="Vente moyen"
                    value={rates.length > 0
                        ? (rates.reduce((s, r) => s + r.sell, 0) / rates.length).toFixed(3)
                        : '—'}
                    icon={ArrowUpRight}
                    color="#fb7185"
                />
            </div>

            {/* Barre de recherche + refresh */}
            <div
                className="p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row gap-3"
                style={{
                    background: 'rgba(15, 58, 26, 0.4)',
                    border: '1px solid rgba(42, 128, 64, 0.3)',
                }}
            >
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a8060' }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une devise (EUR, USD, Euro...)"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg focus:outline-none transition-colors"
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#fff',
                            fontSize: '16px',
                        }}
                    />
                </div>

                <button
                    onClick={() => refetch()}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 min-h-[44px]"
                    style={{
                        background: 'rgba(42, 128, 64, 0.2)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        color: '#4ade80',
                    }}
                >
                    <RefreshCw size={13} />
                    Rafraîchir
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw size={20} className="animate-spin" style={{ color: '#4ade80' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                         style={{ background: 'rgba(42, 128, 64, 0.15)', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
                        <Search size={28} style={{ color: '#4ade80' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#a8c4aa' }}>
                        {search ? 'Aucune devise ne correspond' : 'Aucun taux disponible'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filtered.map((r) => (
                        <RateCard
                            key={r.code}
                            rate={r}
                            onUpdate={(buy, sell) => setAuthModal({ rate: r, buy, sell })}
                        />
                    ))}
                </div>
            )}

            {authModal && (
                <BasicAuthModal
                    rate={authModal.rate}
                    buy={authModal.buy}
                    sell={authModal.sell}
                    onClose={() => setAuthModal(null)}
                />
            )}
        </div>
    )
}

interface RateStatCardProps {
    label: string
    value: string | number
    icon:  LucideIcon
    color: string
}

function RateStatCard({ label, value, icon: Icon, color }: RateStatCardProps) {
    return (
        <div
            className="p-3 sm:p-4 rounded-2xl"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 58, 26, 0.6), rgba(10, 31, 14, 0.6))',
                border: `1px solid ${color}40`,
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: '#a8c4aa' }}>
                    {label}
                </span>
                <Icon size={12} style={{ color }} />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono-nums" style={{ color }}>
                {value}
            </div>
        </div>
    )
}

/* ─── CARD D'UN TAUX (avec édition inline) ─────────────────────────── */
interface RateCardProps {
    rate: Rate
    onUpdate: (buy: number, sell: number) => void
}

function RateCard({ rate, onUpdate }: RateCardProps) {
    const [editing, setEditing] = useState(false)
    const [buy, setBuy]   = useState(rate.buy.toString())
    const [sell, setSell] = useState(rate.sell.toString())

    const handleConfirm = () => {
        const buyNum  = parseFloat(buy)
        const sellNum = parseFloat(sell)
        if (isNaN(buyNum) || isNaN(sellNum)) {
            toast.error('Valeurs invalides')
            return
        }
        if (buyNum >= sellNum) {
            toast.error("L'achat doit être inférieur à la vente")
            return
        }
        onUpdate(buyNum, sellNum)
        setEditing(false)
    }

    const handleCancel = () => {
        setEditing(false)
        setBuy(rate.buy.toString())
        setSell(rate.sell.toString())
    }

    const buyNum  = parseFloat(buy)  || rate.buy
    const sellNum = parseFloat(sell) || rate.sell
    const spread    = sellNum - buyNum
    const spreadPct = buyNum > 0 ? (spread / buyNum) * 100 : 0

    const label = CURRENCY_LABELS[rate.code] ?? rate.code

    return (
        <div
            className="p-4 rounded-2xl transition-all hover:scale-[1.01]"
            style={{
                background: editing
                    ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.12), rgba(15, 58, 26, 0.5))'
                    : 'linear-gradient(135deg, rgba(15, 58, 26, 0.5), rgba(10, 31, 14, 0.6))',
                border: editing
                    ? '1px solid rgba(74, 222, 128, 0.5)'
                    : '1px solid rgba(42, 128, 64, 0.3)',
                boxShadow: editing ? '0 8px 24px rgba(26, 92, 42, 0.3)' : 'none',
            }}
        >
            {/* HEADER : drapeau + code + label + bouton */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="flex-shrink-0 w-12 h-8 rounded overflow-hidden flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <FlagImg code={rate.code} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-base font-bold text-white">{rate.code}</div>
                        <div className="text-[10px] truncate" style={{ color: '#a8c4aa' }}>{label}</div>
                    </div>
                </div>

                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        title="Modifier"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                        style={{
                            background: 'rgba(251, 191, 36, 0.12)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#fbbf24',
                        }}
                    >
                        <Edit2 size={13} />
                    </button>
                ) : (
                    <div className="flex gap-1.5">
                        <button
                            onClick={handleConfirm}
                            title="Valider"
                            className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95"
                            style={{
                                background: 'rgba(74, 222, 128, 0.15)',
                                border: '1px solid rgba(74, 222, 128, 0.3)',
                                color: '#4ade80',
                            }}
                        >
                            <Check size={13} />
                        </button>
                        <button
                            onClick={handleCancel}
                            title="Annuler"
                            className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95"
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: '#a8c4aa',
                            }}
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* PRIX : Achat / Vente côte à côte */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">

                {/* ACHAT */}
                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(42, 128, 64, 0.04))',
                        border: '1px solid rgba(74, 222, 128, 0.25)',
                    }}
                >
                    <div className="flex items-center gap-1 mb-1">
                        <ArrowDownRight size={10} style={{ color: '#4ade80' }} />
                        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#a8c4aa' }}>
                            Achat
                        </span>
                    </div>
                    {editing ? (
                        <input
                            type="number"
                            step="0.0001"
                            value={buy}
                            onChange={(e) => setBuy(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirm()
                                if (e.key === 'Escape') handleCancel()
                            }}
                            autoFocus
                            className="w-full px-1 py-0.5 text-lg font-mono-nums font-bold rounded focus:outline-none"
                            style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(74, 222, 128, 0.4)',
                                color: '#4ade80',
                                fontSize: '16px',
                            }}
                            inputMode="decimal"
                        />
                    ) : (
                        <div className="text-xl font-bold font-mono-nums" style={{ color: '#4ade80' }}>
                            {rate.buy.toFixed(4)}
                        </div>
                    )}
                </div>

                {/* VENTE */}
                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.08), rgba(200, 16, 46, 0.04))',
                        border: '1px solid rgba(251, 113, 133, 0.25)',
                    }}
                >
                    <div className="flex items-center gap-1 mb-1">
                        <ArrowUpRight size={10} style={{ color: '#fb7185' }} />
                        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#a8c4aa' }}>
                            Vente
                        </span>
                    </div>
                    {editing ? (
                        <input
                            type="number"
                            step="0.0001"
                            value={sell}
                            onChange={(e) => setSell(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirm()
                                if (e.key === 'Escape') handleCancel()
                            }}
                            className="w-full px-1 py-0.5 text-lg font-mono-nums font-bold rounded focus:outline-none"
                            style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(251, 113, 133, 0.4)',
                                color: '#fb7185',
                                fontSize: '16px',
                            }}
                            inputMode="decimal"
                        />
                    ) : (
                        <div className="text-xl font-bold font-mono-nums" style={{ color: '#fb7185' }}>
                            {rate.sell.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>

            {/* SPREAD */}
            <div
                className="px-3 py-2 rounded-lg flex items-center justify-between"
                style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(42, 128, 64, 0.15)',
                }}
            >
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#5a8060' }}>
                    Spread
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-mono-nums text-xs" style={{ color: '#a8c4aa' }}>
                        {spread.toFixed(4)}
                    </span>
                    <span
                        className="font-mono-nums text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                            background: spreadPct < 1 ? 'rgba(74, 222, 128, 0.15)' :
                                spreadPct < 2 ? 'rgba(251, 191, 36, 0.15)' :
                                    'rgba(251, 113, 133, 0.15)',
                            color: spreadPct < 1 ? '#4ade80' :
                                spreadPct < 2 ? '#fbbf24' :
                                    '#fb7185',
                        }}
                    >
                        {spreadPct.toFixed(2)}%
                    </span>
                </div>
            </div>

            {editing && (
                <p className="text-[10px] mt-2 text-center" style={{ color: '#5a8060' }}>
                    ⏎ Entrée pour valider · Échap pour annuler
                </p>
            )}
        </div>
    )
}

/* ═══ MODALES — INCHANGÉES ═══════════════════════════════════════════════ */

interface BasicAuthModalProps { rate: Rate; buy: number; sell: number; onClose: () => void }

function BasicAuthModal({ rate, buy, sell, onClose }: BasicAuthModalProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPwd,  setShowPwd]  = useState(false)
    const [error,    setError]    = useState<string | null>(null)

    const update = useMutation({
        mutationFn: async () => {
            const credentials = btoa(`${username}:${password}`)
            await axios.post(
                '/api/rates/update',
                { code: rate.code, buy, sell },
                { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' } }
            )
        },
        onSuccess: () => {
            toast.success(`${rate.code} mis à jour`)
            queryClient.invalidateQueries({ queryKey: ['admin-rates'] })
            onClose()
        },
        onError: (err: unknown) => {
            setError(extractApiErrorMessage(err, 'Identifiants invalides'))
        },
    })

    const isValid = username.length > 0 && password.length > 0

    return (
        <ModalOverlay onClose={onClose}>
            <ModalCard>
                <ModalHeader title="Authentification requise" icon={Lock} onClose={onClose} />
                <form onSubmit={(e) => { e.preventDefault(); if (isValid && !update.isPending) { setError(null); update.mutate() } }}>
                    <div className="p-5 space-y-3">
                        <div className="px-3 py-2 rounded-lg flex items-center gap-2"
                             style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                            <AlertCircle size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />
                            <p className="text-[11px]" style={{ color: '#fbbf24' }}>
                                Modification de <span className="font-bold font-mono-nums">{rate.code}</span> :
                                <span className="font-mono-nums ml-1">A {buy.toFixed(4)} / V {sell.toFixed(4)}</span>
                            </p>
                        </div>
                        <ValidatedField label="Nom d'utilisateur">
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                   placeholder="dev" className="form-input" autoFocus autoComplete="off" />
                        </ValidatedField>
                        <ValidatedField label="Mot de passe">
                            <div className="relative">
                                <input type={showPwd ? 'text' : 'password'} value={password}
                                       onChange={(e) => setPassword(e.target.value)}
                                       placeholder="••••••••" className="form-input pr-10" autoComplete="off" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: '#5a8060' }} tabIndex={-1}>
                                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </ValidatedField>
                        {error && (
                            <div className="px-3 py-2 rounded-lg flex items-center gap-2"
                                 style={{ background: 'rgba(251, 113, 133, 0.1)', border: '1px solid rgba(251, 113, 133, 0.3)' }}>
                                <AlertCircle size={13} style={{ color: '#fb7185', flexShrink: 0 }} />
                                <p className="text-[11px]" style={{ color: '#fb7185' }}>{error}</p>
                            </div>
                        )}
                    </div>
                    <ModalFooter>
                        <button type="button" onClick={onClose} className="btn-cancel">Annuler</button>
                        <button type="submit" disabled={!isValid || update.isPending} className="btn-primary">
                            <Lock size={13} />
                            {update.isPending ? 'Vérification...' : 'Confirmer'}
                        </button>
                    </ModalFooter>
                </form>
            </ModalCard>
        </ModalOverlay>
    )
}

function ResetPasswordModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd]   = useState(false)
    const [touched, setTouched]   = useState(false)

    const error   = touched ? (!password ? 'Mot de passe requis' : password.length < 6 ? 'Au moins 6 caractères' : '') : ''
    const isValid = password && password.length >= 6

    const reset = useMutation({
        mutationFn: async () => { await api.post(`/auth/admin/reset-password/${user.user_id}`, { password }) },
        onSuccess: () => {
            toast.success(`Mot de passe réinitialisé. ${user.username} devra le changer à sa prochaine connexion.`)
            onClose()
        },
        onError: (err: unknown) => { toast.error(extractApiErrorMessage(err, 'Erreur lors de la réinitialisation')) },
    })

    return (
        <ModalOverlay onClose={onClose}>
            <ModalCard>
                <ModalHeader title="Réinitialiser le mot de passe" icon={KeyRound} onClose={onClose} />
                <div className="p-5 space-y-3">
                    <div className="px-3 py-2 rounded-lg flex items-center gap-2"
                         style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.25)' }}>
                        <AlertCircle size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />
                        <p className="text-[11px]" style={{ color: '#60a5fa' }}>
                            <span className="font-semibold">{user.username}</span> devra créer un nouveau mot de passe à sa prochaine connexion.
                        </p>
                    </div>
                    <ValidatedField label="Nouveau mot de passe" error={error} valid={!!isValid && touched}>
                        <div className="relative">
                            <input type={showPwd ? 'text' : 'password'} value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   onBlur={() => setTouched(true)}
                                   placeholder="Au moins 6 caractères" className="form-input pr-10" />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#5a8060' }} tabIndex={-1}>
                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </ValidatedField>
                </div>
                <ModalFooter>
                    <button onClick={onClose} className="btn-cancel">Annuler</button>
                    <button onClick={() => reset.mutate()} disabled={!isValid || reset.isPending} className="btn-primary">
                        <Save size={13} />
                        {reset.isPending ? 'Modification...' : 'Réinitialiser'}
                    </button>
                </ModalFooter>
            </ModalCard>
        </ModalOverlay>
    )
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ username: '', full_name: '', email: '', role: 'CLIENT', password: '', is_active: 1 })
    const [touched, setTouched] = useState({ username: false, email: false, password: false })
    const [showPwd, setShowPwd] = useState(false)

    const errors      = useMemo(() => validateUserForm(form), [form])
    const isFormValid = !errors.username && !errors.email && !errors.password

    const create = useMutation({
        mutationFn: async () => { const r = await api.post('/auth/register', form); return r.data },
        onSuccess: () => {
            toast.success(`Utilisateur "${form.username}" créé. Il devra changer son mot de passe à la première connexion.`)
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            onClose()
        },
        onError: (err: unknown) => { toast.error(extractApiErrorMessage(err, 'Erreur lors de la création')) },
    })

    const handleSubmit = () => {
        setTouched({ username: true, email: true, password: true })
        if (isFormValid) create.mutate()
    }

    return (
        <ModalOverlay onClose={onClose}>
            <ModalCard>
                <ModalHeader title="Nouvel utilisateur" icon={Plus} onClose={onClose} />
                <div className="p-5 space-y-3">
                    <ValidatedField label="Identifiant *" error={touched.username ? errors.username : ''} valid={touched.username && !errors.username && !!form.username}>
                        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                               onBlur={() => setTouched({ ...touched, username: true })}
                               placeholder="ex: jean.dupont" className="form-input" autoFocus />
                    </ValidatedField>
                    <ValidatedField label="Nom complet">
                        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                               placeholder="ex: Jean Dupont" className="form-input" />
                    </ValidatedField>
                    <ValidatedField label="Email" error={touched.email ? errors.email : ''} valid={touched.email && !errors.email && !!form.email}>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                               onBlur={() => setTouched({ ...touched, email: true })}
                               placeholder="ex: jean.dupont@btl.tn" className="form-input" />
                    </ValidatedField>
                    <ValidatedField label="Rôle *">
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="form-input">
                            <option value="CLIENT">CLIENT</option>
                            <option value="TRADER">TRADER</option>
                            <option value="AGENCE">AGENCE</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </ValidatedField>
                    <ValidatedField label="Mot de passe *" error={touched.password ? errors.password : ''}
                                    valid={touched.password && !errors.password && !!form.password}
                                    hint="L'utilisateur devra le changer à sa première connexion">
                        <div className="relative">
                            <input type={showPwd ? 'text' : 'password'} value={form.password}
                                   onChange={(e) => setForm({ ...form, password: e.target.value })}
                                   onBlur={() => setTouched({ ...touched, password: true })}
                                   placeholder="Au moins 6 caractères" className="form-input pr-10" />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#5a8060' }} tabIndex={-1}>
                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </ValidatedField>
                </div>
                <ModalFooter>
                    <button onClick={onClose} className="btn-cancel">Annuler</button>
                    <button onClick={handleSubmit} disabled={!isFormValid || create.isPending} className="btn-primary">
                        <Save size={13} />
                        {create.isPending ? 'Création...' : 'Créer'}
                    </button>
                </ModalFooter>
            </ModalCard>
        </ModalOverlay>
    )
}

/* ═══ COMPOSANTS PARTAGÉS ════════════════════════════════════════════════ */
function ValidatedField({ label, children, error, valid, hint }: {
    label: string; children: React.ReactNode; error?: string; valid?: boolean; hint?: string
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5" style={{ color: '#a8c4aa' }}>
                {label}
                {valid && <CheckCircle2 size={10} style={{ color: '#4ade80' }} />}
            </label>
            <div className={error ? 'field-error' : valid ? 'field-valid' : ''}>{children}</div>
            {error && <p className="text-[10px] flex items-center gap-1" style={{ color: '#fb7185' }}><AlertCircle size={10} />{error}</p>}
            {hint && !error && <p className="text-[10px]" style={{ color: '#5a8060' }}>{hint}</p>}
        </div>
    )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(7, 17, 11, 0.85)', backdropFilter: 'blur(8px)' }}
             onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">{children}</div>
            <style>{`
                .form-input { width:100%; padding:.625rem .75rem; font-size:16px; border-radius:.5rem;
                    background:rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.08); color:#fff;
                    outline:none; transition:border-color .15s,background .15s; }
                .form-input::placeholder { color:rgba(255,255,255,.25); }
                .form-input:focus { border-color:rgba(74,222,128,.5); background:rgba(0,0,0,.5); }
                .field-valid .form-input { border-color:rgba(74,222,128,.4); }
                .field-error .form-input { border-color:rgba(251,113,133,.5); background:rgba(251,113,133,.05); }
                .btn-cancel { padding:.625rem .75rem; font-size:.75rem; font-weight:600; border-radius:.75rem;
                    background:rgba(15,58,26,.5); border:1px solid rgba(42,128,64,.3); color:#a8c4aa; cursor:pointer; transition:all .15s; }
                .btn-cancel:hover { background:rgba(15,58,26,.7); }
                .btn-primary { padding:.625rem .75rem; font-size:.75rem; font-weight:600; border-radius:.75rem;
                    background:linear-gradient(135deg,#2a8040,#1a5c2a); border:1px solid rgba(74,222,128,.4);
                    color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;
                    gap:.5rem; transition:all .15s; min-height:44px; }
                .btn-primary:disabled { opacity:.4; cursor:not-allowed; }
                .btn-primary:hover:not(:disabled) { transform:translateY(-1px); }
            `}</style>
        </div>
    )
}

function ModalCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl overflow-hidden"
             style={{ background:'linear-gradient(180deg,#0f3a1a,#0a1f0e)', border:'1px solid rgba(74,222,128,.25)', boxShadow:'0 20px 60px rgba(0,0,0,.7)' }}>
            {children}
        </div>
    )
}

function ModalHeader({ title, icon: Icon, onClose }: { title: string; icon: LucideIcon; onClose: () => void }) {
    return (
        <div className="px-5 py-4 border-b flex items-center justify-between"
             style={{ background:'rgba(26,92,42,.3)', borderColor:'rgba(42,128,64,.3)' }}>
            <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: '#4ade80' }} />
                <h2 className="text-sm font-semibold text-white">{title}</h2>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center" style={{ color: '#a8c4aa' }}>
                <X size={14} />
            </button>
        </div>
    )
}

function ModalFooter({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-4 grid grid-cols-2 gap-3 border-t"
             style={{ borderColor:'rgba(42,128,64,.3)', background:'rgba(0,0,0,.2)' }}>
            {children}
        </div>
    )
}