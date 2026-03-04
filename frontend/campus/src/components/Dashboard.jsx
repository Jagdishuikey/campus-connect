import React from 'react'
import Activity from './Activity'
import ThemeToggle from './ThemeToggle'

const features = [
  { icon: '📅', title: 'Events', desc: 'See upcoming campus events and RSVP.', page: 'events', gradient: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))' },
  { icon: '👥', title: 'Groups', desc: 'Join clubs and student groups nearby.', page: 'groups', gradient: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(236,72,153,0.1))' },
  { icon: '🔗', title: 'Connections', desc: 'Find classmates and form study groups.', page: 'connections', gradient: 'linear-gradient(135deg,rgba(52,211,153,0.15),rgba(6,182,212,0.1))' },
  { icon: '🔍', title: 'Lost & Found', desc: 'Report lost items or help reunite found ones.', page: 'lostfound', gradient: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,113,133,0.1))' },
]

const FeatureCard = ({ f, onClick }) => (
  <button
    onClick={onClick}
    className="glass-card"
    style={{
      padding: '1.5rem',
      textAlign: 'left',
      width: '100%',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Background gradient accent */}
    <div style={{ position: 'absolute', inset: 0, background: f.gradient, opacity: 0.5, pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>{f.icon}</span>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{f.title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0', lineHeight: 1.5 }}>{f.desc}</p>
    </div>
  </button>
)

const Dashboard = ({ user, onSignOut, onNavigate }) => {
  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Campus Connect</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>
            Welcome back{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email}` : ''}! 👋
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <button
            onClick={() => onNavigate && onNavigate('profile')}
            className="avatar avatar-md"
            style={{ cursor: 'pointer', border: '2px solid var(--glass-border)', transition: 'all 0.25s ease', fontSize: '0.85rem' }}
            title="My Profile"
          >
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '👤'}
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Feature Cards */}
        <section className="grid-features">
          {features.map((f, i) => (
            <FeatureCard key={f.page} f={f} onClick={() => onNavigate && onNavigate(f.page)} />
          ))}
        </section>

        {/* Activity + Announcements */}
        <section className="grid-activity">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Recent activity</h2>
            <Activity />
          </div>

          <aside className="glass-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
              📢 Announcements
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Library closed this Friday for maintenance.',
                'Submit project proposals by next Monday.',
              ].map((a, i) => (
                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', lineHeight: 1.5 }}>
                  {a}
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
