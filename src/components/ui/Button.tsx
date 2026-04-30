import { cn } from '@/lib/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'danger' | 'success'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
}

const variants = {
    primary: 'bg-btl-green hover:bg-btl-green-mid text-white border border-btl-green-light/40',
    ghost:   'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/8',
    danger:  'bg-fx-sell/15 hover:bg-fx-sell/25 text-fx-sell border border-fx-sell/25',
    success: 'bg-btl-green-light/20 hover:bg-btl-green-light/30 text-btl-green-bright border border-btl-green-light/40',
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                'font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
                variants[variant], sizes[size], className
            )}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
                    {children}
        </span>
            ) : children}
        </button>
    )
)
Button.displayName = 'Button'