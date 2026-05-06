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

    const isTypingRef = useRef(false)
    const stopTypingTimer = useRef<ReturnType<typeof setTimeout>>()

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

        if (v.length > 0) {
            if (!isTypingRef.current) {
                isTypingRef.current = true
                onEvent({ type: 'typing', data: { is_typing: true } })
            }
            if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
            stopTypingTimer.current = setTimeout(fireStopTyping, 2500)
        } else {
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

    const hasValue = value.trim().length > 0

    return (
        <div
            className="flex items-end gap-2 p-3 border-t flex-shrink-0"
            style={{
                background: 'var(--color-bg-tertiary)',
                borderColor: 'var(--color-border)',
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
                    background: 'var(--color-bg-input)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                    fontSize: '16px',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-success-border)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
            />
            <button
                onClick={handleSend}
                disabled={!hasValue || disabled}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                           transition-all disabled:opacity-30 disabled:cursor-not-allowed
                           active:scale-95"
                style={{
                    background: !hasValue
                        ? 'var(--color-bg-tertiary)'
                        : 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))',
                    border: '1px solid var(--color-success-border)',
                    color: !hasValue ? 'var(--color-text-tertiary)' : '#fff',
                }}
            >
                <Send size={15} />
            </button>
        </div>
    )
}