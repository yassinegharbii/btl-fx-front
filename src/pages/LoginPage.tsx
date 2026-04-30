import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, ArrowRight, TrendingUp } from 'lucide-react'

import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const login    = useLogin()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    login.mutate({ username: username.trim(), password })
  }

  return (
      <div
          className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
          style={{ background: '#070d09' }}
      >
        {/* Background gradients */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
            radial-gradient(circle at 20% 20%, rgba(74, 222, 128, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(26, 92, 42, 0.18) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(15, 58, 26, 0.1) 0%, transparent 60%)
          `,
            }}
        />

        {/* Grille subtile */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
            linear-gradient(rgba(74, 222, 128, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 222, 128, 0.04) 1px, transparent 1px)
          `,
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(circle at center, black 0%, transparent 70%)',
            }}
        />

        {/* Particules flottantes */}
        <div className="absolute top-[10%] left-[15%] w-1 h-1 rounded-full"
             style={{ background: '#4ade80', boxShadow: '0 0 20px #4ade80', animation: 'float 4s ease-in-out infinite' }} />
        <div className="absolute top-[25%] right-[20%] w-1.5 h-1.5 rounded-full"
             style={{ background: '#4ade80', boxShadow: '0 0 15px #4ade80', animation: 'float 5s ease-in-out infinite 0.5s', opacity: 0.7 }} />
        <div className="absolute bottom-[20%] left-[25%] w-1 h-1 rounded-full"
             style={{ background: '#4ade80', boxShadow: '0 0 12px #4ade80', animation: 'float 3.5s ease-in-out infinite 1s', opacity: 0.5 }} />
        <div className="absolute bottom-[15%] right-[15%] w-2 h-2 rounded-full"
             style={{ background: '#4ade80', boxShadow: '0 0 25px #4ade80', animation: 'float 6s ease-in-out infinite 1.5s', opacity: 0.4 }} />

        {/* ─── Card ─── */}
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
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(74, 222, 128, 0.08)',
                backdropFilter: 'blur(20px)',
              }}
          >
            {/* Header */}
            <div
                className="px-8 pt-10 pb-7 text-center relative"
                style={{
                  background: 'linear-gradient(180deg, rgba(26, 92, 42, 0.4), transparent)',
                }}
            >
              {/* ✅ LOGO PLUS GRAND : 96x96 */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #4ade80, #1a5c2a)',
                        boxShadow: '0 12px 32px rgba(74, 222, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
                      }}
                  >
                    <img
                        src="/images/logo-btl.png"
                        alt="BTL"
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                    />
                    <div
                        className="hidden items-center justify-center w-16 h-16"
                        style={{ display: 'none' }}
                    >
                      <TrendingUp size={42} style={{ color: '#fff' }} strokeWidth={2.5} />
                    </div>
                  </div>
                  {/* Anneau pulsant */}
                  <div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        border: '2px solid rgba(74, 222, 128, 0.4)',
                        animation: 'pulseRing 2s ease-out infinite',
                      }}
                  />
                </div>
              </div>

              <h1
                  className="font-bold text-3xl tracking-tight mb-2"
                  style={{ color: '#fff', letterSpacing: '-0.02em' }}
              >
                BTL-FX
              </h1>
              <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full"
                    style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
                <p className="text-[10px] uppercase tracking-[0.25em] font-semibold"
                   style={{ color: '#a8c4aa' }}>
                  Salle des marchés · Banque Tuniso-Libyenne
                </p>
                <span className="inline-block w-1 h-1 rounded-full"
                      style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
              </div>
            </div>

            {/* Séparateur */}
            <div
                className="mx-8"
                style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.3), transparent)',
                }}
            />

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                       style={{ color: '#a8c4aa' }}>
                  <User size={10} />
                  Identifiant
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nom.utilisateur"
                    autoComplete="username"
                    required
                    className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none transition-all"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(74, 222, 128, 0.5)'
                      e.target.style.background = 'rgba(0, 0, 0, 0.5)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.target.style.background = 'rgba(0, 0, 0, 0.4)'
                    }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                       style={{ color: '#a8c4aa' }}>
                  <Lock size={10} />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 pr-11 text-sm rounded-xl focus:outline-none transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(74, 222, 128, 0.5)'
                        e.target.style.background = 'rgba(0, 0, 0, 0.5)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                        e.target.style.background = 'rgba(0, 0, 0, 0.4)'
                      }}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#a8c4aa')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                      tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {login.isError && (
                  <div
                      className="px-3 py-2 rounded-lg text-[12px] flex items-center gap-2 animate-shake"
                      style={{
                        background: 'rgba(251, 113, 133, 0.1)',
                        border: '1px solid rgba(251, 113, 133, 0.3)',
                        color: '#fb7185',
                      }}
                  >
                    <span>Identifiants incorrects. Veuillez réessayer.</span>
                  </div>
              )}

              <button
                  type="submit"
                  disabled={login.isPending || !username.trim() || !password.trim()}
                  className="w-full py-3 rounded-xl font-semibold text-sm relative overflow-hidden
                         flex items-center justify-center gap-2 text-white
                         transition-all active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #2a8040 0%, #1a5c2a 100%)',
                    border: '1px solid rgba(74, 222, 128, 0.4)',
                    boxShadow: '0 8px 30px rgba(26, 92, 42, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
              >
                <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                      animation: 'shine 1.5s infinite',
                    }}
                />

                {login.isPending ? (
                    <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                        style={{ animation: 'spin 0.8s linear infinite' }} />
                      <span>Connexion...</span>
                    </>
                ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight size={14} />
                    </>
                )}
              </button>
            </form>

            {/* Footer card */}
            <div
                className="px-8 py-4 text-center"
                style={{
                  borderTop: '1px solid rgba(74, 222, 128, 0.08)',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}
            >
              <button
                  onClick={() => navigate('/rates')}
                  className="text-xs transition-colors inline-flex items-center gap-1.5"
                  style={{ color: 'rgba(168, 196, 170, 0.6)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4ade80')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(168, 196, 170, 0.6)')}
              >
                <span>Affichage public des taux</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Footer global */}
          <div className="text-center mt-6">
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              © {new Date().getFullYear()} Banque Tuniso-Libyenne · Tous droits réservés
            </p>
          </div>
        </div>

        <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50%      { transform: translateY(-20px); opacity: 1; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes shine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
      </div>
  )
}