import { Check, CheckCheck } from 'lucide-react'
import type { MessageStatus } from '@/types/chat.types'

export function MessageStatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'READ')
    return <CheckCheck size={14} className="text-fx-blue" />
  if (status === 'DELIVERED')
    return <CheckCheck size={14} className="text-white/40" />
  return <Check size={14} className="text-white/30" />
}