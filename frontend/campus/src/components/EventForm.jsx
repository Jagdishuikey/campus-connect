import React, { useState } from 'react'

const defaultOptions = ['Yes', 'No', 'Maybe']

export default function EventForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [customOptions, setCustomOptions] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const options = customOptions.trim()
      ? customOptions.split(',').map(s => s.trim()).filter(Boolean)
      : defaultOptions

    const poll = { options, votes: {} }
    options.forEach(o => (poll.votes[o] = 0))

    const event = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date || null,
      location: location.trim(),
      description: description.trim(),
      poll,
      createdAt: new Date().toISOString(),
    }

    onCreate(event)
    setTitle(''); setDate(''); setLocation(''); setDescription(''); setCustomOptions('')
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>
        ✏️ Create Event
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" className="glass-input" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="glass-input" style={{ colorScheme: 'dark' }} />
        </div>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="📍 Location" className="glass-input" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="glass-input" rows={3} />
        <input value={customOptions} onChange={e => setCustomOptions(e.target.value)} placeholder="Poll options (comma separated) — leave empty for Yes/No/Maybe" className="glass-input" />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-gradient">Post Event</button>
        </div>
      </div>
    </form>
  )
}
