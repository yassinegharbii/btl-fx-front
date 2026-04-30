import { useThreadTickets } from '@/hooks/useTickets'
import { useAcceptTicket, useDeclineTicket } from '@/hooks/useTickets'
import { useAuthStore } from '@/stores/auth.store'
import { TicketBadge } from './TicketBadge'
import { ExpiryBar } from './ExpiryBar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Ticket } from '@/types/ticket.types'

interface Props { threadId: number }

export function TicketCard({ threadId }: Props) {
  const { data: tickets, isLoading } = useThreadTickets(threadId)
  const user = useAuthStore((s) => s.user)

  if (isLoading) return (
    <div className="flex justify-center py-4">
      <Spinner />
    </div>
  )

  // Afficher le ticket le plus récent PROPOSED ou ACCEPTED_BY_CLIENT
  const active = tickets?.find(
    (t) => t.order_status === 'PROPOSED' || t.order_status === 'ACCEPTED_BY_CLIENT'
  )

  if (!active) return null

  return (
    <div className="my-2 flex justify-start">
      <TicketCardInner ticket={active} isClient={user?.role === 'CLIENT'} />
    </div>
  )
}

function TicketCardInner({ ticket, isClient }: { ticket: Ticket; isClient: boolean }) {
  const accept  = useAcceptTicket()
  const decline = useDeclineTicket()

  const isProposed = ticket.order_status === 'PROPOSED'

  return (
    <div className="w-72 bg-navy-800 border border-fx-blue-dim/25 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono-nums text-[11px] text-blue-400/60 tracking-wide">
          {ticket.ref_ticket}
        </span>
        <TicketBadge status={ticket.order_status} />
      </div>

      {/* Infos */}
      <div className="space-y-1.5">
        <TicketRow label="Opération" value={
          <span className={ticket.operation === 'BUY' ? 'text-fx-buy' : 'text-fx-sell'}>
            {ticket.operation === 'BUY' ? 'Achat' : 'Vente'} {ticket.currency_code}
          </span>
        } />
        <TicketRow label="Montant"
          value={`${ticket.order_amount.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} ${ticket.currency_code}`}
        />
        <TicketRow label="Mode" value={ticket.delivery_mode} />
          <TicketRow label="Agence" value={ticket.branch_name ?? ticket.branch_code} />
      </div>

      {/* Taux négocié — mise en avant */}
      <div className="bg-black/30 rounded-xl py-3 text-center border border-white/5">
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Taux négocié</div>
        <div className="font-mono-nums text-2xl font-semibold text-white">
          {ticket.negotiated_price?.toFixed(4)}
          <span className="text-sm text-white/30 ml-1">TND</span>
        </div>
        {ticket.tnd_equivalent && (
          <div className="text-xs text-white/30 font-mono-nums mt-1">
            = {ticket.tnd_equivalent.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
          </div>
        )}
      </div>

      {/* Commentaire trader */}
      {ticket.trader_comment && (
        <p className="text-xs text-white/40 italic border-l-2 border-white/10 pl-2">
          {ticket.trader_comment}
        </p>
      )}

      {/* Barre d'expiration */}
        {isProposed && <ExpiryBar validUntil={ticket.valid_until} createdAt={ticket.created_at} />}

      {/* Actions client */}
      {isClient && isProposed && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="success"
            size="sm"
            className="flex-1"
            loading={accept.isPending}
            onClick={() => accept.mutate(ticket.order_id)}
          >
            Accepter
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            loading={decline.isPending}
            onClick={() => decline.mutate(ticket.order_id)}
          >
            Refuser
          </Button>
        </div>
      )}
    </div>
  )
}

function TicketRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-white/30">{label}</span>
      <span className="text-xs text-white/70 font-mono-nums">{value}</span>
    </div>
  )
}