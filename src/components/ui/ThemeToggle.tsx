import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/theme'

interface Props {
    /** Taille du bouton, défaut 40 */
    size?: number
    /** Title HTML personnalisé */
    title?: string
}

/**
 * Bouton pour basculer entre dark et light mode.
 *
 * Soleil affiché en mode dark (clic → passage en light)
 * Lune affichée en mode light (clic → passage en dark)
 *
 * @example
 *   <ThemeToggle />
 */
export function ThemeToggle({ size = 40, title }: Props) {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            title={title ?? (isDark ? 'Passer en mode clair' : 'Passer en mode sombre')}
            aria-label="Basculer le thème"
            className="rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
            style={{
                width: size,
                height: size,
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-success-bg)'
                e.currentTarget.style.borderColor = 'var(--color-success-border)'
                e.currentTarget.style.color = 'var(--color-success)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    )
}