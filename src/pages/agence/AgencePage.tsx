import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Search, LogOut, CheckCircle2, ClipboardCheck,
  AlertCircle, Building2, Calendar, User, XCircle,
  Clock, Info, Loader2, MessageSquare,
} from 'lucide-react'

import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface TicketDetails {
  order_id: number
  ref_ticket: string
  client_id: number
  client_name: string | null
  client_username: string | null
  currency_id: number
  currency_code: string | null
  currency_label: string | null
  operation: string
  order_amount: number
  delivery_mode: string
  branch_code: string
  branch_name: string | null
  order_status: string
  market_rate_used: number | null
  negotiated_price: number | null
  tnd_equivalent: number | null
  trader_comment: string | null
  branch_comment: string | null
  valid_until: string | null
  branch_confirmed_at: string | null
  completed_at: string | null
  created_at: string
  is_valid_for_processing: boolean | null
  validity_message: string | null
  bills: Array<{ id: number; bill_value: string; quantity: number }>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PROPOSED:           { label: 'Proposé',  color: '#fbbf24' },
  ACCEPTED_BY_CLIENT: { label: 'Accepté',  color: '#4ade80' },
  DECLINED_BY_CLIENT: { label: 'Refusé',   color: '#fb7185' },
  EXPIRED:            { label: 'Expiré',   color: '#94a3b8' },
  CONFIRMED_BY_BRANCH:{ label: 'En cours', color: '#60a5fa' },
  COMPLETED:          { label: 'Finalisé', color: '#4ade80' },
  CANCELLED:          { label: 'Annulé',   color: '#fb7185' },
}

function getStatusBanner(status: string, isValid: boolean | null) {
  if (status === 'COMPLETED') {
    return { icon: CheckCircle2, bg: 'rgba(74, 222, 128, 0.1)',  border: 'rgba(74, 222, 128, 0.3)',  color: '#4ade80' }
  }
  if (status === 'CONFIRMED_BY_BRANCH') {
    return { icon: ClipboardCheck, bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.3)', color: '#60a5fa' }
  }
  if (status === 'ACCEPTED_BY_CLIENT' && isValid) {
    return { icon: CheckCircle2, bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)', color: '#4ade80' }
  }
  if (status === 'PROPOSED') {
    return { icon: Clock, bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' }
  }
  if (status === 'DECLINED_BY_CLIENT' || status === 'CANCELLED') {
    return { icon: XCircle, bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.3)', color: '#fb7185' }
  }
  if (status === 'EXPIRED') {
    return { icon: Clock, bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8' }
  }
  return { icon: Info, bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', color: '#94a3b8' }
}

function formatDeliveryMode(mode: string): string {
  return {
    CASH:      'Espèces',
    ACCOUNT:   'Virement compte',
    TRANSFER:  'Virement externe',
    CHEQUE:    'Chèque',
    BORDEREAU: 'Bordereau',
  }[mode] ?? mode
}

export default function AgencePage() {
  const user   = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [refNumber, setRefNumber] = useState('')
  const [ticket, setTicket] = useState<TicketDetails | null>(null)
  const [error,  setError]  = useState<string | null>(null)
  const [note,   setNote]   = useState('')

  const search = useMutation({
    mutationFn: async (ref: string) => {
      const r = await api.get<TicketDetails>(`/branch/orders/${ref}`)
      return r.data
    },
    onSuccess: (data) => {
      setTicket(data)
      setError(null)
      setNote('')
    },
    onError: (err: any) => {
      setTicket(null)
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Ticket introuvable')
    },
  })

  // ✅ PRISE EN CHARGE — payload vide
  const processMutation = useMutation({
    mutationFn: async () => {
      const r = await api.post(`/branch/orders/${ticket!.ref_ticket}/confirm-processing`, {})
      return r.data
    },
    onSuccess: () => {
      toast.success('Ticket pris en charge')
      search.mutate(ticket!.ref_ticket)
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Erreur lors de la prise en charge')
    },
  })

  // ✅ FINALISATION — la note est sauvegardée dans branch_comment
  const completeMutation = useMutation({
    mutationFn: async () => {
      const r = await api.post(
          `/branch/orders/${ticket!.ref_ticket}/confirm-completed`,
          { note: note || null }
      )
      return r.data
    },
    onSuccess: () => {
      toast.success('Ticket finalisé avec succès')
      setNote('')
      search.mutate(ticket!.ref_ticket)
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Erreur lors de la finalisation')
    },
  })

  const handleSearch = () => {
    const trimmed = refNumber.trim().replace(/\D/g, '')
    if (!trimmed) return
    const padded = trimmed.padStart(6, '0')
    search.mutate(`FX-${padded}`)
  }

  const handleInputChange = (v: string) => {
    setRefNumber(v.replace(/\D/g, '').slice(0, 6))
  }

  const status = ticket ? STATUS_LABELS[ticket.order_status] : null
  const canProcess  = ticket?.order_status === 'ACCEPTED_BY_CLIENT' && ticket.is_valid_for_processing
  const canComplete = ticket?.order_status === 'CONFIRMED_BY_BRANCH'
  const banner = ticket ? getStatusBanner(ticket.order_status, ticket.is_valid_for_processing) : null

  const clientDisplay = ticket
      ? ticket.client_name ?? ticket.client_username ?? `Client #${ticket.client_id}`
      : ''

  return (
      <div className="min-h-screen flex flex-col" style={{ background: '#070d09' }}>

        {/* HEADER */}
        <header
            className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{
              background: 'rgba(15, 58, 26, 0.7)',
              borderColor: 'rgba(42, 128, 64, 0.3)',
            }}
        >
          <div className="flex items-center gap-3">
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(74, 222, 128, 0.15)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                }}
            >
              <Building2 size={18} style={{ color: '#4ade80' }} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Espace Agence</h1>
              <p className="text-[11px] mt-0.5" style={{ color: '#a8c4aa' }}>
                {user?.full_name ?? user?.username} · Traitement des tickets
              </p>
            </div>
          </div>

          <button
              onClick={logout}
              title="Déconnexion"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
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

        <main className="flex-1 p-6 max-w-3xl mx-auto w-full overflow-y-auto">

          {/* RECHERCHE */}
          <div
              className="p-5 rounded-2xl mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 58, 26, 0.6), rgba(10, 31, 14, 0.6))',
                border: '1px solid rgba(42, 128, 64, 0.3)',
              }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Search size={14} style={{ color: '#4ade80' }} />
              <h2 className="text-sm font-semibold text-white">Rechercher un ticket</h2>
            </div>
            <p className="text-[11px] mb-3" style={{ color: '#a8c4aa' }}>
              Saisissez le numéro du ticket (6 chiffres, ex: 000084)
            </p>

            <div className="flex gap-2">
              <div
                  className="flex-1 flex items-center rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
              >
                <div
                    className="px-3 py-2.5 flex items-center flex-shrink-0"
                    style={{
                      background: 'rgba(74, 222, 128, 0.1)',
                      borderRight: '1px solid rgba(74, 222, 128, 0.2)',
                    }}
                >
                <span className="font-mono-nums text-sm font-bold" style={{ color: '#4ade80' }}>
                  FX-
                </span>
                </div>
                <input
                    value={refNumber}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="000084"
                    inputMode="numeric"
                    maxLength={6}
                    className="flex-1 px-3 py-2.5 text-sm bg-transparent font-mono-nums focus:outline-none tracking-wider"
                    style={{ color: '#fff' }}
                />
              </div>
              <Button onClick={handleSearch} loading={search.isPending} disabled={!refNumber.trim()} className="px-5">
                Rechercher
              </Button>
            </div>

            {refNumber && (
                <div className="mt-2 text-[10px] font-mono-nums" style={{ color: '#5a8060' }}>
                  Référence à rechercher :{' '}
                  <span className="font-bold" style={{ color: '#a8c4aa' }}>FX-{refNumber.padStart(6, '0')}</span>
                </div>
            )}
          </div>

          {error && (
              <div
                  className="flex items-center gap-3 p-4 rounded-xl mb-6"
                  style={{
                    background: 'rgba(200, 16, 46, 0.1)',
                    border: '1px solid rgba(251, 113, 133, 0.3)',
                  }}
              >
                <AlertCircle size={18} style={{ color: '#fb7185' }} />
                <span className="text-sm" style={{ color: '#fb7185' }}>{error}</span>
              </div>
          )}

          {search.isPending && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
          )}

          {/* TICKET */}
          {ticket && status && (
              <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15, 58, 26, 0.5), rgba(10, 31, 14, 0.5))',
                    border: '1px solid rgba(42, 128, 64, 0.3)',
                  }}
              >
                <div
                    className="px-5 py-4 border-b flex items-center justify-between"
                    style={{
                      background: 'rgba(26, 92, 42, 0.2)',
                      borderColor: 'rgba(42, 128, 64, 0.25)',
                    }}
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: '#a8c4aa' }}>
                      Référence
                    </div>
                    <div className="font-mono-nums text-base font-bold text-white mt-0.5">
                      {ticket.ref_ticket}
                    </div>
                  </div>
                  <div
                      className="px-3 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        background: `${status.color}20`,
                        color: status.color,
                        border: `1px solid ${status.color}40`,
                      }}
                  >
                    {status.label}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div
                      className="text-center py-3 rounded-xl"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(42, 128, 64, 0.25)',
                      }}
                  >
                    <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#5a8060' }}>
                      Opération
                    </div>
                    <div className="text-xl font-bold"
                         style={{ color: ticket.operation === 'BUY' ? '#4ade80' : '#fb7185' }}>
                      {ticket.operation === 'BUY' ? '▲ Achat' : '▼ Vente'} {ticket.currency_code}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow
                        label="Montant"
                        value={`${ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} ${ticket.currency_code ?? ''}`}
                    />
                    <InfoRow label="Mode" value={formatDeliveryMode(ticket.delivery_mode)} />
                    <InfoRow label="Agence" value={ticket.branch_name ?? ticket.branch_code} />
                    <InfoRow
                        label="Équivalent"
                        value={`${ticket.tnd_equivalent?.toLocaleString('fr-FR', { minimumFractionDigits: 3 }) ?? '—'} TND`}
                    />
                    <InfoRow label="Client" value={clientDisplay} icon={<User size={11} />} />
                    <InfoRow
                        label="Créé le"
                        value={new Date(ticket.created_at).toLocaleString('fr-FR', {
                          day:'2-digit', month:'2-digit', year:'2-digit',
                          hour:'2-digit', minute:'2-digit',
                        })}
                        icon={<Calendar size={11} />}
                    />
                  </div>

                  {ticket.negotiated_price != null && (
                      <div
                          className="text-center py-4 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(42, 128, 64, 0.25), rgba(74, 222, 128, 0.1))',
                            border: '1px solid rgba(74, 222, 128, 0.35)',
                          }}
                      >
                        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#a8c4aa' }}>
                          Taux négocié
                        </div>
                        <div className="font-mono-nums text-3xl font-bold text-white">
                          {ticket.negotiated_price.toFixed(4)}
                        </div>
                        {ticket.market_rate_used && (
                            <div className="text-[10px] mt-1.5 font-mono-nums" style={{ color: '#5a8060' }}>
                              Marché : <span className="font-semibold">{ticket.market_rate_used.toFixed(4)}</span>
                            </div>
                        )}
                      </div>
                  )}

                  {ticket.trader_comment && (
                      <div
                          className="px-3 py-2 rounded-lg italic text-xs"
                          style={{
                            background: 'rgba(26, 92, 42, 0.2)',
                            borderLeft: '2px solid #2a8040',
                            color: '#e8f0e9',
                          }}
                      >
                        <div className="text-[9px] uppercase tracking-wider mb-1 not-italic" style={{ color: '#5a8060' }}>
                          Commentaire trader
                        </div>
                        « {ticket.trader_comment} »
                      </div>
                  )}

                  {/* ✅ Affichage du commentaire agence si présent (ticket déjà finalisé) */}
                  {ticket.branch_comment && (
                      <div
                          className="px-3 py-2 rounded-lg italic text-xs"
                          style={{
                            background: 'rgba(96, 165, 250, 0.1)',
                            borderLeft: '2px solid #60a5fa',
                            color: '#e8f0e9',
                          }}
                      >
                        <div className="text-[9px] uppercase tracking-wider mb-1 not-italic" style={{ color: '#60a5fa' }}>
                          Commentaire agence
                        </div>
                        « {ticket.branch_comment} »
                      </div>
                  )}

                  {ticket.bills && ticket.bills.length > 0 && (
                      <div
                          className="px-3 py-2.5 rounded-lg space-y-2"
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(42, 128, 64, 0.25)',
                          }}
                      >
                        <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: '#a8c4aa' }}>
                      Coupures {ticket.currency_code}
                    </span>
                          <span className="text-[10px] font-mono-nums" style={{ color: '#5a8060' }}>
                      {ticket.bills.reduce((n, b) => n + b.quantity, 0)} billets
                    </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ticket.bills.map((b) => (
                              <div
                                  key={b.id}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded"
                                  style={{
                                    background: 'rgba(42, 128, 64, 0.12)',
                                    border: '1px solid rgba(74, 222, 128, 0.15)',
                                  }}
                              >
                        <span className="text-xs font-mono-nums font-semibold text-white">
                          {b.bill_value} {ticket.currency_code}
                        </span>
                                <span className="text-[11px] font-mono-nums font-bold" style={{ color: '#4ade80' }}>
                          × {b.quantity}
                        </span>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {ticket.validity_message && banner && (
                      <div
                          className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2"
                          style={{
                            background: banner.bg,
                            border: `1px solid ${banner.border}`,
                            color: banner.color,
                          }}
                      >
                        <banner.icon size={14} style={{ flexShrink: 0 }} />
                        <span className="font-medium">{ticket.validity_message}</span>
                      </div>
                  )}

                  {/* ✅ Note UNIQUEMENT à la finalisation */}
                  {canComplete && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                               style={{ color: '#a8c4aa' }}>
                          <MessageSquare size={10} />
                          Commentaire de l'agence
                        </label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Détails de l'opération en agence (optionnel)..."
                            className="w-full px-3 py-2 text-sm rounded-xl resize-none focus:outline-none transition-colors"
                            style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#fff',
                            }}
                        />
                        <p className="text-[10px]" style={{ color: '#5a8060' }}>
                          Ce commentaire sera enregistré avec le ticket finalisé.
                        </p>
                      </div>
                  )}

                  {canProcess && (
                      <ActionButton
                          loading={processMutation.isPending}
                          onClick={() => processMutation.mutate()}
                          icon={<ClipboardCheck size={16} />}
                          label="Prendre en charge"
                      />
                  )}

                  {canComplete && (
                      <ActionButton
                          loading={completeMutation.isPending}
                          onClick={() => completeMutation.mutate()}
                          icon={<CheckCircle2 size={16} />}
                          label="Finaliser le ticket"
                      />
                  )}

                  {(ticket.branch_confirmed_at || ticket.completed_at) && (
                      <div
                          className="px-3 py-2 rounded-lg space-y-1.5"
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(42, 128, 64, 0.2)',
                          }}
                      >
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#a8c4aa' }}>
                          Workflow
                        </div>
                        {ticket.branch_confirmed_at && (
                            <div className="flex items-center gap-2 text-[11px]" style={{ color: '#a8c4aa' }}>
                              <CheckCircle2 size={11} style={{ color: '#4ade80' }} />
                              Pris en charge le {new Date(ticket.branch_confirmed_at).toLocaleString('fr-FR')}
                            </div>
                        )}
                        {ticket.completed_at && (
                            <div className="flex items-center gap-2 text-[11px]" style={{ color: '#a8c4aa' }}>
                              <CheckCircle2 size={11} style={{ color: '#4ade80' }} />
                              Finalisé le {new Date(ticket.completed_at).toLocaleString('fr-FR')}
                            </div>
                        )}
                      </div>
                  )}
                </div>
              </div>
          )}

          {!ticket && !error && !search.isPending && (
              <div className="text-center py-16">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(42, 128, 64, 0.15)',
                      border: '1px solid rgba(74, 222, 128, 0.25)',
                    }}
                >
                  <Search size={32} style={{ color: '#4ade80' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#a8c4aa' }}>
                  Recherchez un ticket
                </p>
                <p className="text-xs mt-1" style={{ color: '#5a8060' }}>
                  Saisissez le numéro pour voir les détails et les actions disponibles
                </p>
              </div>
          )}
        </main>
      </div>
  )
}

function InfoRow({
                   label, value, icon,
                 }: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
      <div
          className="px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(42, 128, 64, 0.2)',
          }}
      >
        <div className="flex items-center gap-1 mb-1">
          {icon && <span style={{ color: '#5a8060' }}>{icon}</span>}
          <span className="text-[9px] uppercase tracking-wider" style={{ color: '#5a8060' }}>
          {label}
        </span>
        </div>
        <div className="font-mono-nums text-sm font-semibold text-white truncate">
          {value}
        </div>
      </div>
  )
}

function ActionButton({
                        loading, onClick, icon, label,
                      }: {
  loading:  boolean
  onClick:  () => void
  icon:     React.ReactNode
  label:    string
}) {
  return (
      <button
          onClick={onClick}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm
                 flex items-center justify-center gap-2 text-white
                 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #2a8040, #1a5c2a)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            boxShadow: '0 4px 20px rgba(26, 92, 42, 0.3)',
          }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
        <span>{label}</span>
      </button>
  )
}