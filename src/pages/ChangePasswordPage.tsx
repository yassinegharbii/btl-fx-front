import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
    Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle2,
    ArrowRight, LogOut,
} from 'lucide-react'

import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth.api'

export default function ChangePasswordPage() {
    const navigate = useNavigate()
    const user     = useAuthStore((s) => s.user)
    const setAuth  = useAuthStore((s) => s.setAuth)
    const logout   = useAuthStore((s) => s.logout)
    const token    = useAuthStore((s) => s.token)

    const [password,        setPassword]        = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPwd,  setShowPwd]  = useState(false)
    const [showCfm,  setShowCfm]  = useState(false)
    const [touched,  setTouched]  = useState({ pwd: false, cfm: false })

    // Validation en temps réel
    const validation = useMemo(() => {
        const pwdErrors: string[] = []
        if (password.length < 8)            pwdErrors.push('Au moins 8 caractères')
        if (!/[A-Z]/.test(password))        pwdErrors.push('Au moins une majuscule')
        if (!/[a-z]/.test(password))        pwdErrors.push('Au moins une minuscule')
        if (!/[0-9]/.test(password))        pwdErrors.push('Au moins un chiffre')

        const matchError = confirmPassword && password !== confirmPassword
            ? 'Les mots de passe ne correspondent pas'
            : ''

        return {
            pwdErrors,
            matchError,
            isValid: pwdErrors.length === 0 && password === confirmPassword && password.length > 0,
        }
    }, [password, confirmPassword])

    // Critères pour afficher en checklist
    const criteria = [
        { label: 'Au moins 8 caractères',    valid: password.length >= 8 },
        { label: 'Au moins une majuscule',   valid: /[A-Z]/.test(password) },
        { label: 'Au moins une minuscule',   valid: /[a-z]/.test(password) },
        { label: 'Au moins un chiffre',      valid: /[0-9]/.test(password) },
        { label: 'Les deux mots de passe sont identiques', valid: password.length > 0 && password === confirmPassword },
    ]

    const change = useMutation({
        mutationFn: async () => {
            await api.post('/auth/change-password', { password })
        },
        onSuccess: async () => {
            toast.success('Mot de passe modifié avec succès')

            // Recharger les infos user (must_change_password = 0 maintenant)
            try {
                const updatedUser = await authApi.me()
                if (token) setAuth(token, updatedUser)
            } catch {}

            // Naviguer vers l'interface du rôle
            const routes: Record<string, string> = {
                CLIENT: '/chat',
                TRADER: '/trader',
                AGENCE: '/agence',
                ADMIN:  '/admin',
            }
            navigate(routes[user?.role ?? ''] ?? '/login', { replace: true })
        },
        onError: (err: any) => {
            const detail = err.response?.data?.detail
            const msg = typeof detail === 'string' ? detail : 'Erreur lors du changement de mot de passe'
            toast.error(msg)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setTouched({ pwd: true, cfm: true })
        if (validation.isValid) change.mutate()
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: '#070d09' }}
        >
            {/* Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
            radial-gradient(circle at 20% 20%, rgba(74, 222, 128, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(26, 92, 42, 0.18) 0%, transparent 40%)
          `,
                }}
            />

            <div className="relative z-10 w-full max-w-md">
                <div
                    className="absolute inset-0 rounded-3xl blur-2xl opacity-50"
                    style={{
                        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(26, 92, 42, 0.3))',
                    }}
                />

                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, rgba(15, 58, 26, 0.8), rgba(10, 31, 14, 0.95))',
                        border: '1px solid rgba(74, 222, 128, 0.15)',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-8 pt-8 pb-6 text-center relative"
                        style={{
                            background: 'linear-gradient(180deg, rgba(26, 92, 42, 0.4), transparent)',
                        }}
                    >
                        <div className="flex justify-center mb-4">
                            <div
                                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #fbbf24, #b45309)',
                                    boxShadow: '0 12px 32px rgba(251, 191, 36, 0.3)',
                                }}
                            >
                                <Shield size={32} style={{ color: '#fff' }} strokeWidth={2.5} />
                            </div>
                        </div>

                        <h1 className="font-bold text-xl tracking-tight mb-2 text-white">
                            Changement de mot de passe requis
                        </h1>
                        <p className="text-[12px]" style={{ color: '#a8c4aa' }}>
                            Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe avant de continuer.
                        </p>
                    </div>

                    {/* User info bar */}
                    <div
                        className="px-8 py-3 flex items-center gap-3"
                        style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderTop: '1px solid rgba(74, 222, 128, 0.1)',
                            borderBottom: '1px solid rgba(74, 222, 128, 0.1)',
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(74, 222, 128, 0.15)',
                                border: '1px solid rgba(74, 222, 128, 0.25)',
                            }}
                        >
              <span className="text-[11px] font-bold" style={{ color: '#4ade80' }}>
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                                {user?.full_name ?? user?.username}
                            </div>
                            <div className="text-[10px]" style={{ color: '#a8c4aa' }}>
                                {user?.role}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            title="Annuler et se déconnecter"
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'rgba(15, 58, 26, 0.4)',
                                border: '1px solid rgba(42, 128, 64, 0.3)',
                                color: '#a8c4aa',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(200, 16, 46, 0.15)'
                                e.currentTarget.style.color = '#fb7185'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(15, 58, 26, 0.4)'
                                e.currentTarget.style.color = '#a8c4aa'
                            }}
                        >
                            <LogOut size={12} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                                   style={{ color: '#a8c4aa' }}>
                                <Lock size={10} />
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => setTouched({ ...touched, pwd: true })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-11 text-sm rounded-xl focus:outline-none transition-all"
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#fff',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'rgba(74, 222, 128, 0.5)')}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#5a8060' }}
                                    tabIndex={-1}
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                                   style={{ color: '#a8c4aa' }}>
                                <Lock size={10} />
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showCfm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => setTouched({ ...touched, cfm: true })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-11 text-sm rounded-xl focus:outline-none transition-all"
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        border: validation.matchError && touched.cfm
                                            ? '1px solid rgba(251, 113, 133, 0.5)'
                                            : '1px solid rgba(255,255,255,0.08)',
                                        color: '#fff',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'rgba(74, 222, 128, 0.5)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCfm(!showCfm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#5a8060' }}
                                    tabIndex={-1}
                                >
                                    {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {validation.matchError && touched.cfm && (
                                <p className="text-[10px] flex items-center gap-1" style={{ color: '#fb7185' }}>
                                    <AlertCircle size={10} />
                                    {validation.matchError}
                                </p>
                            )}
                        </div>

                        {/* ✅ Critères en checklist */}
                        <div
                            className="px-3 py-3 rounded-xl space-y-1.5"
                            style={{
                                background: 'rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(74, 222, 128, 0.1)',
                            }}
                        >
                            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#a8c4aa' }}>
                                Critères du mot de passe
                            </div>
                            {criteria.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px]">
                                    {c.valid ? (
                                        <CheckCircle2 size={11} style={{ color: '#4ade80' }} />
                                    ) : (
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                                        />
                                    )}
                                    <span style={{
                                        color: c.valid ? '#4ade80' : '#a8c4aa',
                                        transition: 'color 0.2s',
                                    }}>
                    {c.label}
                  </span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={!validation.isValid || change.isPending}
                            className="w-full py-3 rounded-xl font-semibold text-sm
                         flex items-center justify-center gap-2 text-white
                         transition-all active:scale-[0.98]
                         disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                            style={{
                                background: 'linear-gradient(135deg, #2a8040 0%, #1a5c2a 100%)',
                                border: '1px solid rgba(74, 222, 128, 0.4)',
                                boxShadow: '0 8px 30px rgba(26, 92, 42, 0.4)',
                            }}
                        >
                            {change.isPending ? (
                                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                        style={{ animation: 'spin 0.8s linear infinite' }} />
                                    <span>Modification...</span>
                                </>
                            ) : (
                                <>
                                    <span>Confirmer le nouveau mot de passe</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}