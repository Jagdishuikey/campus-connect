import React, { useState, useMemo } from 'react'

export default function Poll({ poll, eventId, onVote }) {
  const [selected, setSelected] = useState('')
  const votedKey = `campus_voted_${eventId}`
  const hasVoted = Boolean(localStorage.getItem(votedKey))

  const total = useMemo(() => Object.values(poll.votes || {}).reduce((a, b) => a + (b || 0), 0), [poll])

  function handleVote(e) {
    e.preventDefault()
    if (!selected || hasVoted) return
    const newVotes = { ...poll.votes }
    newVotes[selected] = (newVotes[selected] || 0) + 1
    onVote({ ...poll, votes: newVotes })
    try { localStorage.setItem(votedKey, selected) } catch (e) { }
  }

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>🗳️ Will you attend?</h4>
      <form onSubmit={handleVote} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {poll.options.map(opt => {
          const count = poll.votes[opt] || 0
          const pct = total ? Math.round((count / total) * 100) : 0
          return (
            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ flex: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name={`poll_${eventId}`}
                  value={opt}
                  checked={selected === opt}
                  onChange={() => setSelected(opt)}
                  disabled={hasVoted}
                  style={{ accentColor: 'var(--accent-violet)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{opt}</span>
              </label>
              <div className="poll-bar-wrap">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{count} • {pct}%</div>
              </div>
            </div>
          )
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button type="submit" className="btn-gradient" style={{ padding: '0.35rem 1rem', fontSize: '0.8rem' }} disabled={!selected || hasVoted}>Vote</button>
          {hasVoted && <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>✓ Thanks — your vote is recorded</span>}
        </div>
      </form>
    </div>
  )
}
