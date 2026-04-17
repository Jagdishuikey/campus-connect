import React from 'react'
import Poll from './Poll'

function getCountdown(dateStr) {
  if (!dateStr) return null
  const eventDate = new Date(dateStr)
  const now = new Date()
  const diffMs = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d ago`, className: 'countdown-badge-past', icon: '⏰' }
  if (diffDays === 0) return { text: 'Today!', className: 'countdown-badge-urgent', icon: '🔥' }
  if (diffDays === 1) return { text: 'Tomorrow', className: 'countdown-badge-urgent', icon: '⚡' }
  if (diffDays <= 3) return { text: `In ${diffDays} days`, className: 'countdown-badge-urgent', icon: '⏳' }
  if (diffDays <= 7) return { text: `In ${diffDays} days`, className: '', icon: '📆' }
  return { text: `In ${diffDays} days`, className: '', icon: '🗓️' }
}

export default function EventCard({ event, onDelete, onUpdate }) {
  function handlePollUpdate(newPoll) {
    onUpdate({ ...event, poll: newPoll })
  }

  const countdown = getCountdown(event.date)

  return (
    <article className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderLeft: '3px solid', borderImage: 'var(--gradient-primary) 1' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{event.title}</h3>
            {countdown && (
              <span className={`countdown-badge ${countdown.className}`}>
                {countdown.icon} {countdown.text}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-glass">📅 {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}</span>
            <span className="badge badge-glass">📍 {event.location || 'Location TBD'}</span>
          </div>
        </div>
        <button onClick={() => onDelete(event._id)} className="btn-ghost btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', flexShrink: 0 }}>Delete</button>
      </div>

      {event.description && (
        <p style={{ margin: '0.875rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{event.description}</p>
      )}

      <Poll poll={event.poll} eventId={event._id} onVote={handlePollUpdate} />
    </article>
  )
}
