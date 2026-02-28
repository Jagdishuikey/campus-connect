import React, { useState } from 'react'

export default function ClubForm({ onCreate }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [admin, setAdmin] = useState('')
  const [college, setCollege] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState(1)

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const club = {
      id: Date.now().toString(),
      name: name.trim(),
      category: category.trim(),
      admin: admin.trim(),
      college: college.trim(),
      description: description.trim(),
      members: Number(members) || 0,
      rating: { total: 0, count: 0 },
      createdAt: new Date().toISOString(),
    }
    onCreate(club)
    setName(''); setCategory(''); setAdmin(''); setCollege(''); setDescription(''); setMembers(1)
  }

  return (
    <form onSubmit={submit} className="glass-card" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>
        ➕ Add Club
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Club name" className="glass-input" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g., Sports)" className="glass-input" />
          <input value={admin} onChange={e => setAdmin(e.target.value)} placeholder="Admin name" className="glass-input" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input value={college} onChange={e => setCollege(e.target.value)} placeholder="🏫 College" className="glass-input" />
          <input type="number" value={members} onChange={e => setMembers(e.target.value)} min={0} placeholder="Members" className="glass-input" />
        </div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="glass-input" rows={3} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-gradient btn-gradient-warm">Add Club</button>
        </div>
      </div>
    </form>
  )
}
