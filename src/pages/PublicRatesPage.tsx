import { useEffect, useState } from 'react'
import { usePublicRates } from '@/hooks/useRates'
import { useRatesStore }  from '@/stores/rates.store'
import { useIsMobile }    from '@/hooks/useIsMobile'

function pad(n: number) { return String(n).padStart(2, '0') }
const DAYS_FR   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function FlagImg({ code, emoji, size = 'lg' }: { code: string; emoji: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const [err, setErr] = useState(false)
  const dimensions = {
    sm: { w: 32, h: 22, fontSize: '1.5rem' },
    md: { w: 48, h: 36, fontSize: '2rem' },
    lg: { w: 80, h: 60, fontSize: '3.2rem' },
  }[size]

  if (err) return <span style={{ fontSize: dimensions.fontSize, lineHeight: 1 }}>{emoji ?? code}</span>
  return (
      <img
          src={`/flags/${code}.png`}
          alt={code}
          onError={() => setErr(true)}
          style={{
            width: dimensions.w,
            height: dimensions.h,
            borderRadius: 3,
            objectFit: 'cover',
            display: 'block',
          }}
      />
  )
}

function TickerFlag({ code, emoji }: { code: string; emoji: string | null }) {
  const [err, setErr] = useState(false)
  if (err) return <span style={{ fontSize: '1.3rem' }}>{emoji ?? code}</span>
  return (
      <img
          src={`/flags/${code}.png`}
          alt={code}
          onError={() => setErr(true)}
          style={{ width: 32, height: 22, borderRadius: 3, objectFit: 'cover' }}
      />
  )
}

export default function PublicRatesPage() {
  usePublicRates()
  const rates = useRatesStore((s) => s.rates)
  const isMobile = useIsMobile()  // < 768px

  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`)
      setDate(`${DAYS_FR[n.getDay()]} ${n.getDate()} ${MONTHS_FR[n.getMonth()]} ${n.getFullYear()}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const tickerItems = rates.filter((r) => r.buy != null)

  return (
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#0a1f0e',
        fontFamily: "'Montserrat', sans-serif",
        color: '#fff',
      }}>
        {/* Background gradients */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `
                    radial-gradient(ellipse 70% 60% at 0% 0%,   rgba(26,92,42,0.9) 0%,  transparent 60%),
                    radial-gradient(ellipse 50% 50% at 100% 100%, rgba(200,16,46,0.12) 0%, transparent 55%),
                    radial-gradient(ellipse 60% 80% at 50% 50%,   #0d2e14 0%, #0a1f0e 100%)`,
        }} />
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `
                    linear-gradient(rgba(26,92,42,0.12) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(26,92,42,0.12) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        {/* HEADER — adaptatif */}
        <header style={{
          position: 'relative', zIndex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 8 : 0,
          padding: isMobile ? '12px 16px' : '14px 32px',
          background: 'linear-gradient(135deg, rgba(15,58,26,0.97), rgba(26,92,42,0.88))',
          borderBottom: '3px solid #c8102e',
          flexShrink: 0,
        }}>
          {/* Logo + titre */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 12 : 22,
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}>
            <div style={{
              background: 'white',
              padding: isMobile ? 6 : 12,
              borderRadius: isMobile ? 10 : 16,
              boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}>
              <img
                  src="/images/logo-btl.png"
                  alt="BTL"
                  style={{
                    height: isMobile ? 36 : 80,
                    width: 'auto',
                    display: 'block',
                  }}
              />
            </div>
            {!isMobile && (
                <div style={{
                  width: 2, height: 56,
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent)',
                }} />
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontSize: isMobile ? '1rem' : '3rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: isMobile ? '0.04em' : '0.07em',
                textTransform: 'uppercase',
                margin: 0,
                lineHeight: 1.1,
              }}>
                Cours de Change
              </h1>
              <span style={{
                fontSize: isMobile ? '0.65rem' : '1.56rem',
                fontWeight: 500,
                color: '#a8c4aa',
                letterSpacing: isMobile ? '0.08em' : '0.16em',
                textTransform: 'uppercase',
              }}>
                            Banque Tuniso-Libyenne
                        </span>
            </div>
          </div>

          {/* Horloge */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: isMobile ? 'center' : 'flex-end',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: isMobile ? 8 : 2,
            paddingTop: isMobile ? 6 : 0,
            borderTop: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}>
            {!isMobile && (
                <div style={{
                  fontSize: '0.85rem',
                  color: '#a8c4aa',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'capitalize',
                }}>
                  {date}
                </div>
            )}
            {isMobile && (
                <span style={{
                  fontSize: '0.65rem',
                  color: '#a8c4aa',
                  textTransform: 'capitalize',
                }}>
                            {date}
                        </span>
            )}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isMobile ? '1rem' : '2.8rem',
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.04em',
              lineHeight: 1,
              textShadow: '0 0 20px rgba(255,255,255,0.25)',
            }}>
              {time || '00:00:00'}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.4)',
              color: '#4ade80',
              fontSize: isMobile ? '0.55rem' : '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 20,
            }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          background: '#4ade80',
                          borderRadius: '50%',
                          animation: 'pulseDot 1.5s infinite',
                          display: 'inline-block',
                        }} />
              EN DIRECT
            </div>
          </div>
        </header>

        {/* TICKER */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'linear-gradient(90deg, #9e0c23, #c8102e, #9e0c23)',
          padding: isMobile ? '8px 0' : '12px 0',
          overflow: 'hidden', flexShrink: 0,
          borderBottom: '1px solid rgba(0,0,0,0.3)',
        }}>
          <div style={{
            display: 'flex',
            animation: 'tickerScroll 45s linear infinite',
            whiteSpace: 'nowrap',
          }}>
            {[0, 1].map((dup) => (
                <div key={dup} style={{ display: 'flex' }}>
                  {tickerItems.map((r) => (
                      <span key={r.code + dup} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: isMobile ? 6 : 12,
                        padding: isMobile ? '0 16px' : '0 32px',
                        fontSize: isMobile ? '0.85rem' : '1.8rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                      }}>
                                    <TickerFlag code={r.code} emoji={r.flag} />
                                    <span style={{ color: 'rgba(255,255,255,0.75)' }}>{r.code}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 2px' }}>|</span>
                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>
                                        A: {r.buy.toFixed(3)}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>
                                        V: {r.sell.toFixed(3)}
                                    </span>
                                </span>
                  ))}
                </div>
            ))}
          </div>
        </div>

        {/* TABLES — Mobile: 1 colonne avec cards. Desktop: 2 tableaux côte à côte */}
        {isMobile ? (
            <MobileRatesView rates={rates} />
        ) : (
            <DesktopRatesView rates={rates} />
        )}

        {/* STATUS BAR */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: isMobile ? '8px 16px' : '6px 36px',
          background: 'rgba(10,31,14,0.85)',
          borderTop: '1px solid rgba(26,92,42,0.3)',
          textAlign: 'center',
          fontSize: isMobile ? '0.65rem' : '0.72rem',
          color: '#5a8060',
          fontWeight: 500,
          letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          © 2026 BTL — Banque Tuniso-Libyenne
        </div>

        <style>{`
                @keyframes pulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(0.6); }
                }
                @keyframes tickerScroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
      </div>
  )
}

/* ─── Vue MOBILE — cards verticales empilées ─────────────────────────── */
function MobileRatesView({ rates }: { rates: any[] }) {
  return (
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flex: 1,
      }}>
        {rates.map((r) => (
            <div key={r.code} style={{
              background: 'rgba(10,31,14,0.7)',
              border: '1px solid rgba(42,92,42,0.4)',
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {/* Drapeau */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                <FlagImg code={r.code} emoji={r.flag} size="md" />
              </div>

              {/* Nom + code */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {r.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2,
                }}>
                            <span style={{
                              fontSize: '0.65rem',
                              color: '#5a8060',
                              fontFamily: "'JetBrains Mono',monospace",
                            }}>
                                {r.code}
                            </span>
                  <span style={{
                    background: 'rgba(26,92,42,0.5)',
                    border: '1px solid rgba(26,92,42,0.65)',
                    color: '#a8c4aa',
                    borderRadius: 4,
                    padding: '1px 6px',
                    fontSize: '0.7rem',
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 600,
                  }}>
                                ×{r.unit}
                            </span>
                </div>
              </div>

              {/* Valeurs */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 2,
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{
                              fontSize: '0.55rem',
                              color: '#5a8060',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                            }}>A</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#4ade80',
                  }}>
                                {r.buy.toFixed(3)}
                            </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{
                              fontSize: '0.55rem',
                              color: '#5a8060',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                            }}>V</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#fb7185',
                  }}>
                                {r.sell.toFixed(3)}
                            </span>
                </div>
              </div>
            </div>
        ))}
      </div>
  )
}

/* ─── Vue DESKTOP — 2 tableaux côte à côte (inchangée) ───────────────── */
function DesktopRatesView({ rates }: { rates: any[] }) {
  const half  = Math.ceil(rates.length / 2)
  const left  = rates.slice(0, half)
  const right = rates.slice(half)

  return (
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        padding: '12px 24px', flex: 1, overflow: 'hidden', minHeight: 0,
      }}>
        {[left, right].map((group, gi) => (
            <div key={gi} style={{
              background: 'rgba(10,31,14,0.72)',
              border: '1px solid rgba(26,92,42,0.35)',
              borderTop: '3px solid #2a8040',
              borderRadius: 12, overflow: 'hidden',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                display: 'flex',
                background: 'rgba(26,92,42,0.3)',
                borderBottom: '1px solid rgba(26,92,42,0.4)',
                flexShrink: 0,
              }}>
                <div style={{ flex: 2.2, padding: '13px 24px', fontSize: '1.44rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a8c4aa', textAlign: 'left' }}>Devise</div>
                <div style={{ flex: 0.8, padding: '13px 20px', fontSize: '1.44rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a8c4aa', textAlign: 'right' }}>Unité</div>
                <div style={{ flex: 1, padding: '13px 24px', fontSize: '1.44rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a8c4aa', textAlign: 'right' }}>Achat</div>
                <div style={{ flex: 1, padding: '13px 28px 13px 24px', fontSize: '1.44rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a8c4aa', textAlign: 'right' }}>Vente</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {group.map((r, i) => (
                    <div key={r.code} style={{
                      display: 'flex',
                      flex: 1,
                      borderBottom: '1px solid rgba(26,92,42,0.18)',
                      background: i % 2 !== 0 ? 'rgba(26,92,42,0.08)' : 'transparent',
                      alignItems: 'center',
                    }}>
                      <div style={{ flex: 2.2, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 100, height: 100, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.11)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, overflow: 'hidden',
                        }}>
                          <FlagImg code={r.code} emoji={r.flag} size="lg" />
                        </div>
                        <div>
                          <div style={{ fontSize: '2.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{r.name}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#5a8060', fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{r.code}</div>
                        </div>
                      </div>
                      <div style={{ flex: 0.8, padding: '0 20px', textAlign: 'right' }}>
                                    <span style={{
                                      background: 'rgba(26,92,42,0.45)',
                                      border: '1px solid rgba(26,92,42,0.65)',
                                      color: '#a8c4aa',
                                      borderRadius: 6, padding: '4px 10px',
                                      fontSize: '1.7rem',
                                      fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                                    }}>
                                        {r.unit}
                                    </span>
                      </div>
                      <div style={{
                        flex: 1, padding: '0 24px', textAlign: 'right',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '2.6rem', fontWeight: 700, color: '#4ade80',
                      }}>
                        {r.buy.toFixed(3)}
                      </div>
                      <div style={{
                        flex: 1, padding: '0 28px 0 24px', textAlign: 'right',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '2.6rem', fontWeight: 700, color: '#fb7185',
                      }}>
                        {r.sell.toFixed(3)}
                      </div>
                    </div>
                ))}
              </div>
            </div>
        ))}
      </div>
  )
}