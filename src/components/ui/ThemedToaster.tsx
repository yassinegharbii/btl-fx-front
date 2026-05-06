import { Toaster } from 'react-hot-toast'
import { useTheme } from '@/theme'

/**
 * Wrapper du Toaster react-hot-toast qui adapte les couleurs au thème.
 *
 * À utiliser à l'intérieur du <ThemeProvider>.
 */
export function ThemedToaster() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: isDark ? '#0d1426' : '#ffffff',
                    color:      isDark ? '#e2e8f0' : '#0a1f0e',
                    border:     `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,31,14,0.1)'}`,
                },
                success: {
                    iconTheme: {
                        primary:   isDark ? '#4ade80' : '#16a34a',
                        secondary: isDark ? '#0d1426' : '#ffffff',
                    },
                },
                error: {
                    iconTheme: {
                        primary:   isDark ? '#fb7185' : '#dc2626',
                        secondary: isDark ? '#0d1426' : '#ffffff',
                    },
                },
            }}
        />
    )
}