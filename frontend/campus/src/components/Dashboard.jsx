import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Activity from './Activity'
import { postsAPI, eventsAPI, groupsAPI, connectionsAPI } from '../services/api'

function getGreeting() {
  const hr = new Date().getHours()
  if (hr < 12) return { text: 'Good morning', emoji: '🌅' }
  if (hr < 17) return { text: 'Good afternoon', emoji: '☀️' }
  if (hr < 21) return { text: 'Good evening', emoji: '🌇' }
  return { text: 'Good night', emoji: '🌙' }
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const Dashboard = () => {
  const user = useSelector(state => state.auth.user)
  const greeting = getGreeting()

  // Quick stats — fetch counts on mount
  const [stats, setStats] = useState({ posts: 0, events: 0, groups: 0, connections: 0 })

  useEffect(() => {
    Promise.allSettled([
      postsAPI.getAll(),
      eventsAPI.getAll(),
      groupsAPI.getAll(),
      connectionsAPI.getAll(),
    ]).then(([posts, events, groups, connections]) => {
      setStats({
        posts: posts.status === 'fulfilled' ? (posts.value.posts?.length || 0) : 0,
        events: events.status === 'fulfilled' ? (events.value.events?.length || 0) : 0,
        groups: groups.status === 'fulfilled' ? (groups.value.groups?.length || 0) : 0,
        connections: connections.status === 'fulfilled'
          ? (connections.value.connections?.filter(c => c.status === 'accepted')?.length || 0) : 0,
      })
    })
  }, [])

  const quickStats = [
    { icon: '📝', label: 'Posts', value: stats.posts, bg: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(6,182,212,0.08))' },
    { icon: '📅', label: 'Events', value: stats.events, bg: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(236,72,153,0.08))' },
    { icon: '👥', label: 'Groups', value: stats.groups, bg: 'linear-gradient(135deg,rgba(52,211,153,0.12),rgba(6,182,212,0.08))' },
    { icon: '🤝', label: 'Friends', value: stats.connections, bg: 'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(251,113,133,0.08))' },
  ]

  return (
    <div className="page-wrapper">
      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ─── Hero Section ─── */}
        <section className="dashboard-hero animate-fade-in">
          <div className="dashboard-hero-content">
            <h1 className="dashboard-greeting">
              {greeting.text},{' '}
              <span className="dashboard-greeting-name">
                {user?.name || user?.email || 'there'}! {greeting.emoji}
              </span>
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening on your campus today.
            </p>
            <div className="dashboard-time-badge">
              🗓️ {getFormattedDate()}
            </div>
          </div>
        </section>

        {/* ─── Quick Stats ─── */}
        <section className="quick-stats-row">
          {quickStats.map((s, i) => (
            <div
              key={s.label}
              className="glass-card quick-stat animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div style={{ position: 'absolute', inset: 0, background: s.bg, pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="quick-stat-icon">{s.icon}</span>
                <div className="quick-stat-value">{s.value}</div>
                <div className="quick-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ─── Activity + Announcements ─── */}
        <section className="grid-activity">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Recent activity
            </h2>
            <Activity user={user} />
          </div>

          <aside className="glass-card announcements-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📢</span> Announcements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                'Library closed this Friday for maintenance.',
                'Submit project proposals by next Monday.',
                'New campus shuttle routes starting next week.',
              ].map((a, i) => (
                <div key={i} className="announcement-item animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                  <span className="announcement-dot" />
                  <p className="announcement-text">{a}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
