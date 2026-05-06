import { useContext } from 'react'
import { ThemeContext } from './ThemeProvider'

/**
 * Hook pour accéder au thème courant et le modifier.
 *
 * @example
 *   const { theme, toggleTheme } = useTheme()
 *   if (theme === 'dark') { ... }
 */
export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) {
        throw new Error('useTheme doit être utilisé à l\'intérieur d\'un <ThemeProvider>')
    }
    return ctx
}