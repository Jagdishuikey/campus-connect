import React, { useState } from 'react'
import Login from './Login'
import Signup from './Signup'

const Auth = ({ onAuth }) => {
  const [tab, setTab] = useState('login')

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)', pointerEvents: 'none', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1),transparent 70%)', pointerEvents: 'none', animation: 'float 6s ease-in-out infinite 1s' }} />

      <div style={{ width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1fr', gap: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', position: 'relative', zIndex: 1 }} className="animate-fade-in">

        {/* Two-column layout on larger screens */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

          {/* === LEFT — Hero Sidebar === */}
          <aside style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', background: 'linear-gradient(135deg,#1e1b4b,#312e81,#1e293b)', position: 'relative', overflow: 'hidden' }}>
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(139,92,246,0.1),transparent 50%,rgba(6,182,212,0.08))', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }} className="gradient-text">Campus Connect</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 320 }}>
                Connect with classmates, discover campus events, and join groups — all in one place.
              </p>

              <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: '🎓', title: 'Events', desc: 'Find and RSVP to campus events.' },
                  { icon: '🤝', title: 'Groups', desc: 'Join clubs and study groups.' },
                  { icon: '🔗', title: 'Connections', desc: 'Find classmates nearby.' },
                ].map((f, i) => (
                  <div key={i} className={`animate-fade-in animate-delay-${i + 1}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.08)', fontSize: '1.1rem', flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{f.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* === RIGHT — Form Area === */}
          <main style={{ padding: '3rem', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 380 }}>

              {/* Header + Tab Switcher */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {tab === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0 1.25rem' }}>Get started with Campus Connect</p>

                {/* Pill Tabs */}
                <div style={{ display: 'inline-flex', background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)', padding: 3, border: '1px solid var(--glass-border)' }}>
                  <button
                    onClick={() => setTab('login')}
                    style={{
                      padding: '0.45rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      background: tab === 'login' ? 'var(--gradient-primary)' : 'transparent',
                      color: tab === 'login' ? '#fff' : 'var(--text-muted)',
                    }}
                  >Login</button>
                  <button
                    onClick={() => setTab('signup')}
                    style={{
                      padding: '0.45rem 1.25rem',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      background: tab === 'signup' ? 'var(--gradient-green)' : 'transparent',
                      color: tab === 'signup' ? '#fff' : 'var(--text-muted)',
                    }}
                  >Sign up</button>
                </div>
              </div>

              {/* Form */}
              <div className="animate-fade-in" key={tab}>
                {tab === 'login' ? (
                  <Login onAuth={onAuth} switchToSignup={() => setTab('signup')} />
                ) : (
                  <Signup onAuth={onAuth} switchToLogin={() => setTab('login')} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Auth
