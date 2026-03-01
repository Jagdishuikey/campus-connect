import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'campus_lost_found'

const CATEGORIES = [
    { label: 'Electronics', icon: '📱', color: 'rgba(139,92,246,0.15)' },
    { label: 'Books', icon: '📚', color: 'rgba(249,115,22,0.15)' },
    { label: 'Clothing', icon: '👕', color: 'rgba(236,72,153,0.15)' },
    { label: 'Keys', icon: '🔑', color: 'rgba(251,191,36,0.15)' },
    { label: 'ID / Cards', icon: '🪪', color: 'rgba(52,211,153,0.15)' },
    { label: 'Bags', icon: '🎒', color: 'rgba(6,182,212,0.15)' },
    { label: 'Accessories', icon: '👓', color: 'rgba(168,85,247,0.15)' },
    { label: 'Other', icon: '📦', color: 'rgba(100,116,139,0.15)' },
]

const LostFound = ({ onBack }) => {
    const [items, setItems] = useState([])
    const [query, setQuery] = useState('')
    const [filterType, setFilterType] = useState('all') // all | lost | found

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('Electronics')
    const [location, setLocation] = useState('')
    const [contact, setContact] = useState('')
    const [itemType, setItemType] = useState('lost') // lost | found-item

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            setItems(raw ? JSON.parse(raw) : [])
        } catch (e) { setItems([]) }
    }, [])

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch (e) { }
    }, [items])

    function addItem(e) {
        e.preventDefault()
        if (!title.trim()) return
        const item = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            category,
            location: location.trim(),
            contact: contact.trim(),
            type: itemType,
            found: false,
            createdAt: new Date().toISOString(),
        }
        setItems(prev => [item, ...prev])
        setTitle(''); setDescription(''); setLocation(''); setContact('')
    }

    function toggleFound(id) {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, found: !item.found } : item
        ))
    }

    function deleteItem(id) {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const filtered = items.filter(item => {
        if (filterType === 'lost' && (item.type !== 'lost' || item.found)) return false
        if (filterType === 'found' && !item.found) return false
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (item.title || '').toLowerCase().includes(q)
            || (item.category || '').toLowerCase().includes(q)
            || (item.description || '').toLowerCase().includes(q)
    })

    const catObj = CATEGORIES.find(c => c.label === category) || CATEGORIES[0]
    const lostCount = items.filter(i => !i.found).length
    const foundCount = items.filter(i => i.found).length

    return (
        <div className="page-wrapper">
            {/* Header */}
            <header className="page-header page-header-flex">
                <div>
                    <button onClick={onBack} className="btn-ghost" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Dashboard</button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Lost & Found</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Report lost items or help reunite found ones</p>
                </div>
                {/* Stats */}
                <div className="lf-stats">
                    <div className="glass-card" style={{ padding: '0.6rem 1.2rem', textAlign: 'center', cursor: 'default' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-rose)' }}>{lostCount}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lost</div>
                    </div>
                    <div className="glass-card" style={{ padding: '0.6rem 1.2rem', textAlign: 'center', cursor: 'default' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{foundCount}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Resolved</div>
                    </div>
                </div>
            </header>

            <main style={{ position: 'relative', zIndex: 1 }}>
                <div className="grid-form-list">

                    {/* === Left — Post Form === */}
                    <div>
                        <form onSubmit={addItem} className="glass-card" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>
                                📋 Report an Item
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

                                {/* Lost / Found toggle */}
                                <div style={{ display: 'inline-flex', background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)', padding: 3, border: '1px solid var(--glass-border)', alignSelf: 'flex-start' }}>
                                    <button type="button" onClick={() => setItemType('lost')}
                                        style={{
                                            padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
                                            background: itemType === 'lost' ? 'linear-gradient(135deg,#fb7185,#f97316)' : 'transparent',
                                            color: itemType === 'lost' ? '#fff' : 'var(--text-muted)'
                                        }}>
                                        🔴 I Lost
                                    </button>
                                    <button type="button" onClick={() => setItemType('found-item')}
                                        style={{
                                            padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
                                            background: itemType === 'found-item' ? 'linear-gradient(135deg,#34d399,#06b6d4)' : 'transparent',
                                            color: itemType === 'found-item' ? '#fff' : 'var(--text-muted)'
                                        }}>
                                        🟢 I Found
                                    </button>
                                </div>

                                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Item name (e.g., Blue water bottle)" className="glass-input" required />

                                {/* Category selector */}
                                <div>
                                    <label className="form-label">Classification</label>
                                    <div className="grid-categories">
                                        {CATEGORIES.map(cat => (
                                            <button key={cat.label} type="button" onClick={() => setCategory(cat.label)}
                                                style={{
                                                    padding: '0.5rem 0.25rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: category === cat.label ? '2px solid var(--accent-violet)' : '1px solid var(--glass-border)',
                                                    background: category === cat.label ? cat.color : 'transparent',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: category === cat.label ? 600 : 400,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.2rem',
                                                }}>
                                                <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="📍 Where was it lost/found?" className="glass-input" />
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the item (color, brand, distinguishing marks...)" className="glass-input" rows={3} />
                                <input value={contact} onChange={e => setContact(e.target.value)} placeholder="📧 Your contact info (email / phone)" className="glass-input" />

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-gradient btn-gradient-warm">Post Item</button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* === Right — Items List === */}
                    <div>
                        {/* Search + Filter */}
                        <div className="search-filter-row">
                            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search items..." className="glass-input" style={{ flex: 1, minWidth: 200 }} />
                            <div style={{ display: 'inline-flex', background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)', padding: 3, border: '1px solid var(--glass-border)' }}>
                                {['all', 'lost', 'found'].map(f => (
                                    <button key={f} type="button" onClick={() => setFilterType(f)}
                                        style={{
                                            padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s', textTransform: 'capitalize',
                                            background: filterType === f ? 'var(--gradient-primary)' : 'transparent',
                                            color: filterType === f ? '#fff' : 'var(--text-muted)'
                                        }}>
                                        {f === 'all' ? 'All' : f === 'lost' ? 'Still Lost' : 'Resolved'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {filtered.length === 0 && (
                                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>🔍</span>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>No items posted yet</h3>
                                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Report a lost or found item using the form.</p>
                                </div>
                            )}

                            {filtered.map(item => {
                                const cat = CATEGORIES.find(c => c.label === item.category) || CATEGORIES[7]
                                return (
                                    <article key={item.id} className="glass-card animate-fade-in"
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            borderLeft: '3px solid',
                                            borderImage: item.found
                                                ? 'linear-gradient(135deg,#34d399,#06b6d4) 1'
                                                : item.type === 'lost'
                                                    ? 'linear-gradient(135deg,#fb7185,#f97316) 1'
                                                    : 'linear-gradient(135deg,#34d399,#06b6d4) 1',
                                            opacity: item.found ? 0.65 : 1,
                                            transition: 'opacity 0.3s',
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                            {/* Left content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', textDecoration: item.found ? 'line-through' : 'none' }}>{item.title}</h3>
                                                    <span className="badge" style={{
                                                        background: item.type === 'lost' ? 'rgba(251,113,133,0.15)' : 'rgba(52,211,153,0.15)',
                                                        color: item.type === 'lost' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                                                        fontSize: '0.65rem',
                                                    }}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span>
                                                    {item.found && <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)', fontSize: '0.65rem' }}>✅ Resolved</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span className="badge badge-glass" style={{ gap: '0.25rem' }}>{cat.icon} {item.category}</span>
                                                    {item.location && <span className="badge badge-glass">📍 {item.location}</span>}
                                                    <span className="badge badge-glass" style={{ fontSize: '0.65rem' }}>
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p style={{ margin: '0.6rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</p>
                                                )}
                                                {item.contact && (
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>📧 {item.contact}</div>
                                                )}
                                            </div>

                                            {/* Right actions */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                                {/* Found checkmark button */}
                                                <button
                                                    onClick={() => toggleFound(item.id)}
                                                    title={item.found ? 'Mark as still lost' : 'Mark as found'}
                                                    style={{
                                                        width: 36, height: 36,
                                                        borderRadius: 'var(--radius-full)',
                                                        border: item.found ? '2px solid var(--accent-emerald)' : '2px solid var(--glass-border)',
                                                        background: item.found ? 'rgba(52,211,153,0.15)' : 'transparent',
                                                        color: item.found ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                                        fontSize: '1rem',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.25s',
                                                    }}
                                                >
                                                    {item.found ? '✓' : '○'}
                                                </button>
                                                <button onClick={() => deleteItem(item.id)} className="btn-ghost btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default LostFound
