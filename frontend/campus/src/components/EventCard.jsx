import React from 'react'
import Poll from './Poll'

export default function EventCard({ event, onDelete, onUpdate }) {
  function handlePollUpdate(newPoll) {
    onUpdate({ ...event, poll: newPoll })
  }

  return (
    <article className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderLeft: '3px solid', borderImage: 'var(--gradient-primary) 1' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{event.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
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
