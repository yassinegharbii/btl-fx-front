import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
    open:     boolean
    onClose:  () => void
    children: ReactNode
    /** Position du drawer */
    side?:    'left' | 'right' | 'bottom'
    /** Largeur en mode left/right (par défaut 85vw, max 320px) */
    width?:   string
    /** Affiche le bouton X dans le coin */
    showCloseButton?: boolean
    /** Titre optionnel en haut */
    title?:   string
}

/**
 * Drawer générique pour mobile.
 *
 * @example
 * <MobileDrawer open={isOpen} onClose={() => setOpen(false)} side="left" title="Menu">
 *   <NavLinks />
 * </MobileDrawer>
 */
export function MobileDrawer({
                                 open,
                                 onClose,
                                 children,
                                 side = 'left',
                                 width = '85vw',
                                 showCloseButton = true,
                                 title,
                             }: Props) {
    /* ─── Bloque le scroll du body quand le drawer est ouvert ──────── */
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

    /* ─── Fermer avec Escape ─────────────────────────────────────────── */
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    /* ─── Calcul du transform initial selon le côté ──────────────────── */
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
                    background: 'rgba(7, 17, 11, 0.7)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease-out',
                }}
            />

            {/* Drawer */}
            <div
                className="absolute flex flex-col overflow-hidden"
                style={{
                    ...drawerStyle,
                    background: 'linear-gradient(180deg, #0f3a1a, #0a1f0e)',
                    borderRight: side === 'left'  ? '1px solid rgba(74, 222, 128, 0.2)' : 'none',
                    borderLeft:  side === 'right' ? '1px solid rgba(74, 222, 128, 0.2)' : 'none',
                    borderTop:   side === 'bottom' ? '1px solid rgba(74, 222, 128, 0.2)' : 'none',
                    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
                    animation: `${animationName} 0.25s ease-out`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header optionnel */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                         style={{
                             borderColor: 'rgba(42, 128, 64, 0.3)',
                             background: 'rgba(15, 58, 26, 0.8)',
                         }}>
                        {title ? (
                            <h2 className="text-sm font-semibold text-white">{title}</h2>
                        ) : (
                            <div />
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                    background: 'rgba(15, 58, 26, 0.4)',
                                    border: '1px solid rgba(42, 128, 64, 0.3)',
                                    color: '#a8c4aa',
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