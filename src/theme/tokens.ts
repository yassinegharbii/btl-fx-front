/**
 * BTL-FX — Theme Tokens
 *
 * Définit toutes les couleurs sémantiques de l'application pour les modes
 * dark et light. Ces tokens sont appliqués via les variables CSS définies
 * dans src/index.css.
 *
 * Référencement dans le code :
 *   style={{ color: 'var(--color-text-primary)' }}
 *   style={{ background: 'var(--color-bg-card)' }}
 */

export type ThemeMode = 'dark' | 'light'

export interface ThemeTokens {
    /* ─── Backgrounds ─── */
    bgPrimary:      string  // Fond principal de l'app
    bgSecondary:    string  // Fond secondaire (sidebar, panels)
    bgTertiary:     string  // Fond tertiaire (zones spéciales)
    bgCard:         string  // Fond des cards
    bgCardHover:    string  // Fond des cards au hover
    bgInput:        string  // Fond des inputs
    bgOverlay:      string  // Fond de modale (overlay)
    bgElevated:     string  // Surfaces élevées (modales, tooltips)

    /* ─── Texte ─── */
    textPrimary:    string  // Texte principal (titres)
    textSecondary:  string  // Texte secondaire (descriptions)
    textTertiary:   string  // Texte tertiaire (légendes)
    textMuted:      string  // Texte très atténué
    textInverse:    string  // Texte sur fond coloré

    /* ─── Accents BTL (vert) ─── */
    accentPrimary:    string  // Vert principal (boutons primaires)
    accentSecondary:  string  // Vert secondaire
    accentBright:     string  // Vert vif (BUY, success)
    accentDim:        string  // Vert foncé (fond gradient)
    accentPale:       string  // Vert très pâle (texte sur fond vert)

    /* ─── États ─── */
    success:        string  // Succès (vert)
    successBg:      string  // Fond succès
    successBorder:  string  // Bordure succès
    danger:         string  // Erreur/SELL (rouge)
    dangerBg:       string
    dangerBorder:   string
    warning:        string  // Attention (jaune)
    warningBg:      string
    warningBorder:  string
    info:           string  // Info (bleu)
    infoBg:         string
    infoBorder:     string
    neutral:        string  // Neutre (gris)
    neutralBg:      string
    neutralBorder:  string

    /* ─── Bordures & séparateurs ─── */
    border:         string  // Bordure standard
    borderStrong:   string  // Bordure marquée
    borderSubtle:   string  // Bordure subtile
    divider:        string  // Séparateurs

    /* ─── Effets ─── */
    shadow:         string  // Ombre standard
    shadowLg:       string  // Grande ombre
    glow:           string  // Glow vert (boutons importants)
}

/* ════════════════════════════════════════════════════════════════════════ */
/*                            DARK MODE                                     */
/*  Reprend EXACTEMENT les couleurs actuelles de BTL-FX                    */
/* ════════════════════════════════════════════════════════════════════════ */

export const darkTokens: ThemeTokens = {
    /* Backgrounds */
    bgPrimary:    '#070d09',                       // Noir verdâtre (fond app)
    bgSecondary:  'rgba(10, 31, 14, 0.9)',         // Sidebar
    bgTertiary:   'rgba(15, 58, 26, 0.4)',         // Panels secondaires
    bgCard:       'rgba(15, 58, 26, 0.5)',         // Cards
    bgCardHover:  'rgba(15, 58, 26, 0.7)',         // Cards hover
    bgInput:      'rgba(0, 0, 0, 0.4)',            // Inputs
    bgOverlay:    'rgba(7, 13, 9, 0.85)',          // Modale overlay
    bgElevated:   'linear-gradient(180deg, #0f3a1a, #0a1f0e)',

    /* Texte */
    textPrimary:   '#ffffff',                       // Blanc pur
    textSecondary: '#a8c4aa',                       // Vert pâle
    textTertiary:  '#5a8060',                       // Vert dim
    textMuted:     'rgba(255, 255, 255, 0.3)',      // Très atténué
    textInverse:   '#0a1f0e',                       // Pour fond vert

    /* Accents BTL */
    accentPrimary:   '#1a5c2a',                     // Vert BTL principal
    accentSecondary: '#2a8040',                     // Vert secondaire
    accentBright:    '#4ade80',                     // Vert vif (BUY)
    accentDim:       '#0f3a1a',                     // Vert foncé (gradient)
    accentPale:      '#a8c4aa',                     // Vert pâle

    /* États */
    success:       '#4ade80',
    successBg:     'rgba(74, 222, 128, 0.15)',
    successBorder: 'rgba(74, 222, 128, 0.3)',
    danger:        '#fb7185',
    dangerBg:      'rgba(251, 113, 133, 0.1)',
    dangerBorder:  'rgba(251, 113, 133, 0.3)',
    warning:       '#fbbf24',
    warningBg:     'rgba(251, 191, 36, 0.1)',
    warningBorder: 'rgba(251, 191, 36, 0.3)',
    info:          '#60a5fa',
    infoBg:        'rgba(96, 165, 250, 0.1)',
    infoBorder:    'rgba(96, 165, 250, 0.3)',
    neutral:       '#94a3b8',
    neutralBg:     'rgba(148, 163, 184, 0.1)',
    neutralBorder: 'rgba(148, 163, 184, 0.25)',

    /* Bordures */
    border:        'rgba(42, 128, 64, 0.3)',
    borderStrong:  'rgba(42, 128, 64, 0.5)',
    borderSubtle:  'rgba(42, 128, 64, 0.15)',
    divider:       'rgba(42, 128, 64, 0.25)',

    /* Effets */
    shadow:        '0 4px 16px rgba(0, 0, 0, 0.4)',
    shadowLg:      '0 20px 60px rgba(0, 0, 0, 0.7)',
    glow:          '0 4px 16px rgba(26, 92, 42, 0.3)',
}

/* ════════════════════════════════════════════════════════════════════════ */
/*                            LIGHT MODE                                    */
/*  Garde l'identité verte BTL avec des fonds clairs                       */
/* ════════════════════════════════════════════════════════════════════════ */

export const lightTokens: ThemeTokens = {
    /* Backgrounds — clairs avec teinte verte subtile */
    bgPrimary:    '#f0f5f1',                        // Blanc cassé verdâtre
    bgSecondary:  '#ffffff',                        // Sidebar blanc
    bgTertiary:   '#e8f0ea',                        // Panels secondaires
    bgCard:       '#ffffff',                        // Cards blanches
    bgCardHover:  '#f5faf6',                        // Cards hover
    bgInput:      '#ffffff',                        // Inputs blancs
    bgOverlay:    'rgba(10, 31, 14, 0.4)',          // Modale overlay
    bgElevated:   '#ffffff',                        // Modales

    /* Texte — sombre sur fond clair */
    textPrimary:   '#0a1f0e',                       // Vert très foncé (titres)
    textSecondary: '#3d5a42',                       // Vert moyen-foncé
    textTertiary:  '#5a8060',                       // Vert dim (légendes)
    textMuted:     'rgba(10, 31, 14, 0.4)',         // Très atténué
    textInverse:   '#ffffff',                       // Sur fond vert

    /* Accents BTL — versions légèrement adaptées */
    accentPrimary:   '#1a5c2a',                     // Vert BTL principal (inchangé)
    accentSecondary: '#2a8040',                     // Vert secondaire (inchangé)
    accentBright:    '#16a34a',                     // Vert vif un peu + sombre pour contraste
    accentDim:       '#dcf2e0',                     // Très pâle (pour gradients)
    accentPale:      '#3d5a42',                     // Vert moyen pour texte

    /* États — versions plus saturées pour contraste */
    success:       '#16a34a',
    successBg:     'rgba(22, 163, 74, 0.08)',
    successBorder: 'rgba(22, 163, 74, 0.25)',
    danger:        '#dc2626',
    dangerBg:      'rgba(220, 38, 38, 0.08)',
    dangerBorder:  'rgba(220, 38, 38, 0.25)',
    warning:       '#d97706',
    warningBg:     'rgba(217, 119, 6, 0.08)',
    warningBorder: 'rgba(217, 119, 6, 0.25)',
    info:          '#2563eb',
    infoBg:        'rgba(37, 99, 235, 0.08)',
    infoBorder:    'rgba(37, 99, 235, 0.25)',
    neutral:       '#64748b',
    neutralBg:     'rgba(100, 116, 139, 0.08)',
    neutralBorder: 'rgba(100, 116, 139, 0.2)',

    /* Bordures */
    border:        'rgba(42, 128, 64, 0.2)',
    borderStrong:  'rgba(42, 128, 64, 0.35)',
    borderSubtle:  'rgba(42, 128, 64, 0.1)',
    divider:       'rgba(42, 128, 64, 0.15)',

    /* Effets */
    shadow:        '0 1px 3px rgba(10, 31, 14, 0.08), 0 1px 2px rgba(10, 31, 14, 0.04)',
    shadowLg:      '0 10px 40px rgba(10, 31, 14, 0.12), 0 4px 12px rgba(10, 31, 14, 0.06)',
    glow:          '0 4px 16px rgba(22, 163, 74, 0.2)',
}

/* ─── Mapping mode → tokens ─── */
export const themes: Record<ThemeMode, ThemeTokens> = {
    dark:  darkTokens,
    light: lightTokens,
}

/* ─── Convertit les tokens en variables CSS ─── */
export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
    return {
        '--color-bg-primary':       tokens.bgPrimary,
        '--color-bg-secondary':     tokens.bgSecondary,
        '--color-bg-tertiary':      tokens.bgTertiary,
        '--color-bg-card':          tokens.bgCard,
        '--color-bg-card-hover':    tokens.bgCardHover,
        '--color-bg-input':         tokens.bgInput,
        '--color-bg-overlay':       tokens.bgOverlay,
        '--color-bg-elevated':      tokens.bgElevated,

        '--color-text-primary':     tokens.textPrimary,
        '--color-text-secondary':   tokens.textSecondary,
        '--color-text-tertiary':    tokens.textTertiary,
        '--color-text-muted':       tokens.textMuted,
        '--color-text-inverse':     tokens.textInverse,

        '--color-accent-primary':   tokens.accentPrimary,
        '--color-accent-secondary': tokens.accentSecondary,
        '--color-accent-bright':    tokens.accentBright,
        '--color-accent-dim':       tokens.accentDim,
        '--color-accent-pale':      tokens.accentPale,

        '--color-success':          tokens.success,
        '--color-success-bg':       tokens.successBg,
        '--color-success-border':   tokens.successBorder,
        '--color-danger':           tokens.danger,
        '--color-danger-bg':        tokens.dangerBg,
        '--color-danger-border':    tokens.dangerBorder,
        '--color-warning':          tokens.warning,
        '--color-warning-bg':       tokens.warningBg,
        '--color-warning-border':   tokens.warningBorder,
        '--color-info':             tokens.info,
        '--color-info-bg':          tokens.infoBg,
        '--color-info-border':      tokens.infoBorder,
        '--color-neutral':          tokens.neutral,
        '--color-neutral-bg':       tokens.neutralBg,
        '--color-neutral-border':   tokens.neutralBorder,

        '--color-border':           tokens.border,
        '--color-border-strong':    tokens.borderStrong,
        '--color-border-subtle':    tokens.borderSubtle,
        '--color-divider':          tokens.divider,

        '--shadow':                 tokens.shadow,
        '--shadow-lg':              tokens.shadowLg,
        '--shadow-glow':            tokens.glow,
    }
}