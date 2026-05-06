import { cn } from '@/lib/cn'
import { type ButtonHTMLAttributes, forwardRef, useState, type CSSProperties } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'danger' | 'success'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
}

/* ─── Styles par variant — utilisent les variables CSS ─── */
function getVariantStyle(variant: string, hover: boolean): CSSProperties {
    switch (variant) {
        case 'primary':
            return {
                background: hover
                    ? 'linear-gradient(135deg, var(--color-success), var(--color-accent-secondary))'
                    : 'linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))',
                border: '1px solid var(--color-success-border)',
                color: '#fff',
                boxShadow: hover ? 'var(--shadow-glow)' : 'none',
            }
        case 'ghost':
            return {
                background: hover ? 'var(--color-bg-card-hover)' : 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
            }
        case 'danger':
            return {
                background: hover
                    ? 'var(--color-danger-bg)'
                    : 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                color: 'var(--color-danger)',
                opacity: hover ? 0.9 : 1,
            }
        case 'success':
            return {
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                color: 'var(--color-success)',
                opacity: hover ? 0.85 : 1,
            }
        default:
            return {}
    }
}

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({ variant = 'primary', size = 'md', loading, className, children, disabled, style, ...props }, ref) => {
        const [hover, setHover] = useState(false)
        const variantStyle = getVariantStyle(variant, hover)

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={cn(
                    'font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
                    sizes[size], className
                )}
                style={{ ...variantStyle, ...style }}
                {...props}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {children}
                    </span>
                ) : children}
            </button>
        )
    }
)
Button.displayName = 'Button'