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

export default function ClubCard({ club, onDelete, onRate }) {
  const ratedKey = `campus_club_rated_${club.id}`
  const [hasRated, setHasRated] = useState(Boolean(localStorage.getItem(ratedKey)))

  const avg = useMemo(() => {
    return club.rating.count ? Math.round((club.rating.total / club.rating.count) * 10) / 10 : 0
  }, [club])

  function handleRate(val) {
    if (hasRated) return
    const updated = { ...club, rating: { ...club.rating } }
    updated.rating.total = (updated.rating.total || 0) + val
    updated.rating.count = (updated.rating.count || 0) + 1
    try { localStorage.setItem(ratedKey, String(val)); setHasRated(true) } catch (e) { }
    onRate(updated)
  }

  return (
    <article className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderLeft: '3px solid', borderImage: 'linear-gradient(135deg,#f97316,#ec4899) 1' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{club.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-glass">{club.category}</span>
            <span className="badge badge-glass">🏫 {club.college}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
          <span className="badge badge-cyan">👥 {club.members} members</span>
          <button onClick={() => onDelete(club.id)} className="btn-ghost btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>Delete</button>
        </div>
      </div>

      {club.description && (
        <p style={{ margin: '0.875rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{club.description}</p>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Stars value={Math.round(avg)} onRate={handleRate} disabled={hasRated} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{avg} / 5 ({club.rating.count || 0})</span>
        </div>
        {hasRated && <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>✓ Thanks for rating</span>}
      </div>
    </article>
  )
}
