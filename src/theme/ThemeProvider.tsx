import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { ThemeMode } from './tokens'

interface ThemeContextValue {
    theme:      ThemeMode
    setTheme:   (mode: ThemeMode) => void
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'btl-fx-theme'

/** Lit le thème stocké, ou retourne 'dark' par défaut */
function getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    return 'dark'  // BTL-FX démarre toujours en dark par défaut
}

interface Props {
    children: ReactNode
}

export function ThemeProvider({ children }: Props) {
    const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)

    /** Applique le thème sur l'élément <html> */
    useEffect(() => {
        document.documentElement.dataset.theme = theme
        document.documentElement.style.colorScheme = theme
    }, [theme])

    const setTheme = (mode: ThemeMode) => {
        localStorage.setItem(STORAGE_KEY, mode)
        setThemeState(mode)
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}