export function TypingIndicator() {
    return (
        <div
            className="flex items-center gap-2 px-4 py-1.5 flex-shrink-0"
            style={{
                background: 'var(--color-bg-tertiary)',
                borderTop: '1px solid var(--color-border-subtle)',
            }}
        >
            <div className="flex items-center gap-1">
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                        background: 'var(--color-success)',
                        animation: 'typingBounce 1.2s infinite ease-in-out',
                        animationDelay: '0s',
                    }}
                />
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                        background: 'var(--color-success)',
                        animation: 'typingBounce 1.2s infinite ease-in-out',
                        animationDelay: '0.2s',
                    }}
                />
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                        background: 'var(--color-success)',
                        animation: 'typingBounce 1.2s infinite ease-in-out',
                        animationDelay: '0.4s',
                    }}
                />
            </div>
            <span className="text-[11px] italic" style={{ color: 'var(--color-text-secondary)' }}>
                en train d'écrire...
            </span>

            <style>{`
                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30%           { transform: translateY(-3px); opacity: 1; }
                }
            `}</style>
        </div>
    )
}