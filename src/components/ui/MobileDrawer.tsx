import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
    open:     boolean
    onClose:  () => void
    children: ReactNode
    side?:    'left' | 'right' | 'bottom'
    width?:   string
    showCloseButton?: boolean
    title?:   string
}

export function MobileDrawer({
                                 open,
                                 onClose,
                                 children,
                                 side = 'left',
                                 width = '85vw',
                                 showCloseButton = true,
                                 title,
                             }: Props) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    const drawerStyle: React.CSSProperties =
        side === 'left'
            ? { left: 0, top: 0, bottom: 0, width, maxWidth: 320 }
            : side === 'right'
                ? { right: 0, top: 0, bottom: 0, width, maxWidth: 320 }
                : { left: 0, right: 0, bottom: 0, maxHeight: '85vh', borderTopLeftRadius: 20, borderTopRightRadius: 20 }

    const animationName =
        side === 'left'   ? 'slideInLeft' :
            side === 'right'  ? 'slideInRight' :
                'slideInBottom'

    return (
        <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0"
                style={{
                    background: 'var(--color-bg-overlay)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease-out',
                }}
            />

            {/* Drawer */}
            <div
                className="absolute flex flex-col overflow-hidden"
                style={{
                    ...drawerStyle,
                    background: 'var(--color-bg-secondary)',
                    borderRight: side === 'left'  ? '1px solid var(--color-border)' : 'none',
                    borderLeft:  side === 'right' ? '1px solid var(--color-border)' : 'none',
                    borderTop:   side === 'bottom' ? '1px solid var(--color-border)' : 'none',
                    boxShadow: 'var(--shadow-lg)',
                    animation: `${animationName} 0.25s ease-out`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header optionnel */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                         style={{
                             borderColor: 'var(--color-border)',
                             background: 'var(--color-bg-tertiary)',
                         }}>
                        {title ? (
                            <h2 className="text-sm font-semibold"
                                style={{ color: 'var(--color-text-primary)' }}>
                                {title}
                            </h2>
                        ) : (
                            <div />
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-secondary)',
                                }}
                                aria-label="Fermer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to   { transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to   { transform: translateX(0); }
                }
                @keyframes slideInBottom {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}