import React, { useState } from 'react'

const sample = [
  { id: 1, user: 'Alice Johnson', avatar: 'AJ', time: '2h ago', text: 'Joined the Data Science club — excited to meet everyone!' },
  { id: 2, user: 'Campus Events', avatar: 'CE', time: '5h ago', text: 'Spring Festival — Booth signups open now.' },
  { id: 3, user: 'Bob Lee', avatar: 'BL', time: '1d ago', text: 'Looking for a study partner for Calculus II.' },
]

const ActivityItem = ({ a, onDelete }) => (
  <div className="glass-card animate-fade-in" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
    <div className="avatar avatar-md">{a.avatar}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{a.user}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.time}</span>
          <button
            onClick={() => { if (window.confirm('Delete this post?')) onDelete(a.id) }}
            className="btn-ghost btn-danger"
            aria-label={`Delete post ${a.id}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
          >Delete</button>
        </div>
      </div>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.text}</p>
    </div>
  </div>
)

const Activity = () => {
  const [items, setItems] = useState(sample)
  const [newText, setNewText] = useState('')

  const post = () => {
    if (!newText.trim()) return
    const next = { id: Date.now(), user: 'You', avatar: 'Y', time: 'just now', text: newText }
    setItems([next, ...items])
    setNewText('')
  }

  const remove = (id) => {
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <div>
      {/* Post Composer */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.875rem' }}>
          <div className="avatar avatar-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>Y</div>
          <div style={{ flex: 1 }}>
            <textarea
              rows={3}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Share an update with your campus..."
              className="glass-input"
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add photos, links, or tags</span>
              <button onClick={post} className="btn-gradient" style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}>Post</button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map(a => (
          <ActivityItem key={a.id} a={a} onDelete={remove} />
        ))}
      </div>
    </div>
  )
}

export default Activity
