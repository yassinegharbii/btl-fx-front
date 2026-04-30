import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { WsOutEvent } from '@/types/chat.types'

interface Props {
  onSend:  (content: string) => void
  onEvent: (event: WsOutEvent) => void
  disabled?: boolean
}

export function ChatInput({ onSend, onEvent, disabled }: Props) {
  const [value, setValue] = useState('')

  // Indique si on a déjà notifié "is_typing: true"
  const isTypingRef = useRef(false)
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout>>()

  // Cleanup en cas de démontage
  useEffect(() => {
    return () => {
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
      if (isTypingRef.current) {
        onEvent({ type: 'typing', data: { is_typing: false } })
      }
    }
  }, [])

  const fireStopTyping = () => {
    if (isTypingRef.current) {
      isTypingRef.current = false
      onEvent({ type: 'typing', data: { is_typing: false } })
    }
  }

  const handleChange = (v: string) => {
    setValue(v)

    // Si on tape : envoyer is_typing: true (une seule fois) + reset timer 2s
    if (v.length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true
        onEvent({ type: 'typing', data: { is_typing: true } })
      }
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
      stopTypingTimer.current = setTimeout(fireStopTyping, 2500)
    } else {
      // Champ vide → arrêter typing immédiatement
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
      fireStopTyping()
    }
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
    fireStopTyping()
  }

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
      <div
          className="flex items-end gap-2 p-3 border-t flex-shrink-0"
          style={{
            background: 'rgba(15, 58, 26, 0.4)',
            borderColor: 'rgba(42, 128, 64, 0.3)',
          }}
      >
      <textarea
          rows={1}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder="Message..."
          className="flex-1 resize-none rounded-xl px-3 py-2 text-sm
                   focus:outline-none transition-colors max-h-32 overflow-y-auto"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
          }}
      />
        <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                   transition-all disabled:opacity-30 disabled:cursor-not-allowed
                   active:scale-95"
            style={{
              background: !value.trim()
                  ? 'rgba(42, 128, 64, 0.2)'
                  : 'linear-gradient(135deg, #2a8040, #1a5c2a)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#fff',
            }}
        >
          <Send size={15} />
        </button>
      </div>
  )
}