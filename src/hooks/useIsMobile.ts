import { useState, useEffect } from 'react'

/**
 * Breakpoints standards (alignés sur Tailwind) :
 * - sm:  640px
 * - md:  768px  ← seuil "mobile" par défaut
 * - lg:  1024px
 * - xl:  1280px
 */

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

const BREAKPOINTS: Record<Breakpoint, number> = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
}

/**
 * Détecte si la fenêtre est plus petite que le breakpoint donné.
 * Par défaut, "mobile" = < 768px (md).
 *
 * @example
 * const isMobile = useIsMobile()        // < 768px
 * const isMobile = useIsMobile('lg')    // < 1024px (inclut tablettes)
 */
export function useIsMobile(breakpoint: Breakpoint = 'md'): boolean {
    const threshold = BREAKPOINTS[breakpoint]

    const [isMobile, setIsMobile] = useState(() => {
        // SSR-safe : on suppose desktop par défaut côté serveur
        if (typeof window === 'undefined') return false
        return window.innerWidth < threshold
    })

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia(`(max-width: ${threshold - 1}px)`)
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)

        // Sync initial
        setIsMobile(mediaQuery.matches)

        // Écoute des changements (rotation, redimensionnement)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [threshold])

    return isMobile
}

/**
 * Retourne le breakpoint actif sous forme de string.
 * Utile pour des comportements à plusieurs paliers.
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
        if (typeof window === 'undefined') return 'desktop'
        const w = window.innerWidth
        if (w < 768) return 'mobile'
        if (w < 1024) return 'tablet'
        return 'desktop'
    })

    useEffect(() => {
        const compute = () => {
            const w = window.innerWidth
            if (w < 768) setBp('mobile')
            else if (w < 1024) setBp('tablet')
            else setBp('desktop')
        }

        compute()
        window.addEventListener('resize', compute)
        return () => window.removeEventListener('resize', compute)
    }, [])

    return bp
}