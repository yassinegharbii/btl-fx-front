import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { Lock, User, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useLogin()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!username || !password) {
            setError('Veuillez remplir tous les champs')
            return
        }

        login.mutate(
            { username, password },
            {
                onError: (err: any) => {
                    const detail = err.response?.data?.detail
                    setError(typeof detail === 'string' ? detail : 'Identifiants invalides')
                },
            }
        )
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
            style={{ background: 'var(--color-bg-primary)' }}
        >
            {/* ─── ThemeToggle dans le coin haut-droit ─── */}
            <div
                className="absolute z-20"
                style={{
                    top: 'calc(1rem + env(safe-area-inset-top, 0))',
                    right: '1rem',
                }}
            >
                <ThemeToggle />
            </div>

            {/* Background animé radial */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(circle at 20% 20%, var(--color-success-bg) 0%, transparent 40%),
                        radial-gradient(circle at 80% 80%, var(--color-success-bg) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, var(--color-bg-tertiary) 0%, transparent 70%)
                    `,
                }}
            />

            {/* Grid décorative — desktop uniquement */}
            <div
                className="absolute inset-0 pointer-events-none hidden md:block"
                style={{
                    backgroundImage: `
                        linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
                        linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Particules — desktop uniquement */}
            <div className="hidden md:block">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            width:  `${100 + i * 50}px`,
                            height: `${100 + i * 50}px`,
                            background: 'var(--color-success-bg)',
                            opacity: 0.4 - i * 0.05,
                            top:    `${10 + i * 25}%`,
                            left:   `${10 + i * 25}%`,
                            filter: 'blur(40px)',
                            animation: `float ${15 + i * 5}s ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Container principal */}
            <div className="relative z-10 w-full max-w-md">

                {/* Glow décoratif */}
                <div
                    className="absolute inset-0 rounded-3xl blur-3xl opacity-50 pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-success-bg), var(--color-accent-primary))',
                    }}
                />

                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-lg)',
                        backdropFilter: 'blur(20px)',
                    }}
                >

                    {/* HEADER avec logo */}
                    <div
                        className="px-6 sm:px-8 pt-8 pb-6 text-center relative"
                        style={{
                            background: 'linear-gradient(180deg, var(--color-success-bg), transparent)',
                        }}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 rounded-3xl blur-xl opacity-60"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-success), var(--color-accent-secondary))',
                                        animation: 'pulseRing 3s ease-in-out infinite',
                                    }}
                                />
                                <div
                                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff, #f0f9f1)',
                                        boxShadow: 'var(--shadow-glow)',
                                    }}
                                >
                                    <img
                                        src="/images/logo-btl.png"
                                        alt="BTL"
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none'
                                            const parent = (e.target as HTMLImageElement).parentElement
                                            if (parent) {
                                                parent.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" stroke="#1a5c2a" stroke-width="2" fill="none"><path d="M3 10v11a1 1 0 001 1h16a1 1 0 001-1V10"/><path d="M3 10l9-7 9 7"/></svg>'
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 mb-2">
                            <Building2 size={14} style={{ color: 'var(--color-text-secondary)' }} />
                            <span className="text-[10px] uppercase tracking-widest font-semibold"
                                  style={{ color: 'var(--color-text-secondary)' }}>
                                Banque Tuniso-Libyenne
                            </span>
                        </div>

                        <h1 className="font-bold text-xl sm:text-2xl tracking-tight mb-1"
                            style={{ color: 'var(--color-text-primary)' }}>
                            BTL FX
                        </h1>
                        <p className="text-[11px] sm:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            Plateforme de négociation de devises
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4">

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                                   style={{ color: 'var(--color-text-secondary)' }}>
                                <User size={10} />
                                Identifiant
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Votre identifiant"
                                    autoComplete="username"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                                    style={{
                                        background: 'var(--color-bg-input)',
                                        border: '1px solid var(--color-border-subtle)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '16px',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-success-border)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-subtle)')}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                                   style={{ color: 'var(--color-text-secondary)' }}>
                                <Lock size={10} />
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none transition-all"
                                    style={{
                                        background: 'var(--color-bg-input)',
                                        border: '1px solid var(--color-border-subtle)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: '16px',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-success-border)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border-subtle)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center"
                                    style={{ color: 'var(--color-text-tertiary)' }}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="px-3 py-2 rounded-lg text-[12px] sm:text-xs"
                                style={{
                                    background: 'var(--color-danger-bg)',
                                    border: '1px solid var(--color-danger-border)',
                                    color: 'var(--color-danger)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Bouton submit */}
                        <button
                            type="submit"
                            disabled={login.isPending}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm
                                       flex items-center justify-center gap-2 text-white
                                       transition-all active:scale-[0.98]
                                       disabled:opacity-60 disabled:cursor-not-allowed
                                       min-h-[48px]"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-accent-secondary) 0%, var(--color-accent-primary) 100%)',
                                border: '1px solid var(--color-success-border)',
                                boxShadow: 'var(--shadow-glow)',
                            }}
                        >
                            {login.isPending ? (
                                <>
                                    <span
                                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                                        style={{ animation: 'spin 0.8s linear infinite' }}
                                    />
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>

                        {/* Lien vers les taux publics */}
                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/rates')}
                                className="text-[11px] underline transition-colors"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Consulter les taux de change
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div
                        className="px-6 sm:px-8 py-3 text-center text-[10px]"
                        style={{
                            background: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-tertiary)',
                            borderTop: '1px solid var(--color-border-subtle)',
                        }}
                    >
                        © 2026 BTL — Système sécurisé
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulseRing {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50%      { transform: scale(1.05); opacity: 0.8; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50%      { transform: translate(20px, -30px); }
                }
            `}</style>
        </div>
    )
}