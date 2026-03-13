import React, { useState, useMemo } from 'react'

function Stars({ value, onRate, disabled }) {
  const arr = [1, 2, 3, 4, 5]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {arr.map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onRate && onRate(i)}
          disabled={disabled}
          className={`star-btn ${i <= value ? 'star-active' : 'star-inactive'}`}
        >★</button>
      ))}
    </div>
  )
}

export default function ClubCard({ club, onDelete, onRate, onJoin, onLeave, user }) {
  const ratedKey = `campus_club_rated_${club._id}`
  const [hasRated, setHasRated] = useState(Boolean(localStorage.getItem(ratedKey)))
  const [showRegForm, setShowRegForm] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showMembers, setShowMembers] = useState(false)

  const currentUserId = user?.id || user?._id
  const isMember = useMemo(() => {
    if (!club.members || !Array.isArray(club.members)) return false
    return club.members.some(m => {
      const memberId = typeof m === 'string' ? m : m?._id
      return memberId === currentUserId
    })
  }, [club.members, currentUserId])

  const isAdmin = useMemo(() => {
    if (!club.admin) return false
    const adminId = typeof club.admin === 'string' ? club.admin : club.admin?._id
    return adminId === currentUserId
  }, [club.admin, currentUserId])

  const avg = useMemo(() => {
    const rating = club.rating || { total: 0, count: 0 }
    return rating.count ? Math.round((rating.total / rating.count) * 10) / 10 : 0
  }, [club])

  function handleRate(val) {
    if (hasRated) return
    const rating = club.rating || { total: 0, count: 0 }
    const updated = { ...club, rating: { ...rating } }
    updated.rating.total = (updated.rating.total || 0) + val
    updated.rating.count = (updated.rating.count || 0) + 1
    try { localStorage.setItem(ratedKey, String(val)); setHasRated(true) } catch (e) { }
    onRate(updated)
  }

  async function handleJoin() {
    try {
      setJoining(true)
      await onJoin(club._id)
    } finally {
      setJoining(false)
      setShowRegForm(false)
    }
  }

  async function handleLeave() {
    try {
      setJoining(true)
      await onLeave(club._id)
    } finally {
      setJoining(false)
    }
  }

  const memberCount = club.memberCount || (Array.isArray(club.members) ? club.members.length : 0)

  return (
    <article className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderLeft: '3px solid', borderImage: 'linear-gradient(135deg,#f97316,#ec4899) 1' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{club.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-glass">{club.category}</span>
            {club.college && <span className="badge badge-glass">🏫 {club.college}</span>}
            {isAdmin && <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-violet)', fontSize: '0.65rem' }}>👑 Admin</span>}
            {isMember && !isAdmin && <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)', fontSize: '0.65rem' }}>✅ Registered</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="badge badge-cyan"
            style={{ cursor: 'pointer', border: 'none', background: 'rgba(6,182,212,0.15)' }}
          >
            👥 {memberCount} members
          </button>
          {isAdmin && <button onClick={() => onDelete(club._id)} className="btn-ghost btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>Delete</button>}
        </div>
      </div>

      {club.description && (
        <p style={{ margin: '0.875rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{club.description}</p>
      )}

      {/* Members list (toggle) */}
      {showMembers && Array.isArray(club.members) && club.members.length > 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>📋 Registered Members</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {club.members.map((m, i) => {
              const name = typeof m === 'string' ? 'Member' : m?.name || 'Member'
              const college = typeof m !== 'string' && m?.college ? m.college : ''
              return (
                <span key={typeof m === 'string' ? m : m?._id || i} className="badge badge-glass" style={{ fontSize: '0.72rem' }}>
                  {name}{college ? ` • ${college}` : ''}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Registration Section */}
      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
        {!isMember ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>🎫 Registration</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  {club.maxMembers ? `${memberCount}/${club.maxMembers} spots filled` : 'Open registration'}
                </p>
              </div>
              {!showRegForm && (
                <button onClick={() => setShowRegForm(true)} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem' }}>
                  Register Now
                </button>
              )}
            </div>

            {/* Registration Confirmation Form */}
            {showRegForm && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(139,92,246,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  You are registering as <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</strong> ({user?.email || ''})
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
                  By joining, you'll become a member of <strong>{club.name}</strong> and will be visible to other members.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowRegForm(false)} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>Cancel</button>
                  <button onClick={handleJoin} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem' }} disabled={joining}>
                    {joining ? 'Registering...' : '✅ Confirm Registration'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--accent-emerald)' }}>✅ You're Registered</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                You are a member of this group
              </p>
            </div>
            {!isAdmin && (
              <button onClick={handleLeave} className="btn-ghost btn-danger" style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }} disabled={joining}>
                {joining ? '...' : 'Leave Group'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Stars value={Math.round(avg)} onRate={handleRate} disabled={hasRated} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{avg} / 5 ({(club.rating && club.rating.count) || 0})</span>
        </div>
        {hasRated && <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>✓ Thanks for rating</span>}
      </div>
    </article>
  )
}
