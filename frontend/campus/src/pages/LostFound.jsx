import React, { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { lostFoundAPI } from '../services/api'
import { setPage } from '../store/uiSlice'

const CATEGORIES = [
    { label: 'Electronics', value: 'electronics', icon: '📱', color: 'rgba(139,92,246,0.15)' },
    { label: 'Books', value: 'books', icon: '📚', color: 'rgba(249,115,22,0.15)' },
    { label: 'Clothing', value: 'clothing', icon: '👕', color: 'rgba(236,72,153,0.15)' },
    { label: 'Keys', value: 'keys', icon: '🔑', color: 'rgba(251,191,36,0.15)' },
    { label: 'Documents', value: 'documents', icon: '🪪', color: 'rgba(52,211,153,0.15)' },
    { label: 'Accessories', value: 'accessories', icon: '👓', color: 'rgba(168,85,247,0.15)' },
    { label: 'Other', value: 'other', icon: '📦', color: 'rgba(100,116,139,0.15)' },
]

const LostFound = () => {
    const dispatch = useDispatch()
    const onBack = () => dispatch(setPage('dashboard'))
    const [items, setItems] = useState([])
    const [query, setQuery] = useState('')
    const [filterType, setFilterType] = useState('all') // all | lost | found
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('electronics')
    const [location, setLocation] = useState('')
    const [contact, setContact] = useState('')
    const [itemType, setItemType] = useState('lost') // lost | found
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        loadItems()
    }, [])

    async function loadItems() {
        try {
            setLoading(true)
            const data = await lostFoundAPI.getAll()
            setItems(data.items || [])
        } catch (e) {
            setError(e.message)
            console.error('Load items error:', e)
        } finally {
            setLoading(false)
        }
    }

    async function addItem(e) {
        e.preventDefault()
        if (!title.trim()) return
        try {
            setError('')
            const itemData = {
                title: title.trim(),
                description: description.trim(),
                category,
                location: location.trim(),
                contactInfo: contact.trim(),
                type: itemType,
                date: new Date().toISOString(),
            }
            const data = await lostFoundAPI.create(itemData, imageFile)
            setItems(prev => [data.item, ...prev])
            setTitle(''); setDescription(''); setLocation(''); setContact('')
            setImageFile(null)
            if (imagePreview) URL.revokeObjectURL(imagePreview)
            setImagePreview(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (e) {
            setError(e.message)
        }
    }

    async function toggleFound(id) {
        try {
            setError('')
            const item = items.find(i => i._id === id)
            if (!item) return
            const newStatus = item.status === 'resolved' ? 'open' : 'resolved'
            const data = await lostFoundAPI.update(id, { status: newStatus })
            setItems(prev => prev.map(i => i._id === id ? data.item : i))
        } catch (e) {
            setError(e.message)
        }
    }

    async function deleteItem(id) {
        try {
            setError('')
            await lostFoundAPI.delete(id)
            setItems(prev => prev.filter(item => item._id !== id))
        } catch (e) {
            setError(e.message)
        }
    }

    const filtered = items.filter(item => {
        const isResolved = item.status === 'resolved'
        if (filterType === 'lost' && (item.type !== 'lost' || isResolved)) return false
        if (filterType === 'found' && !isResolved) return false
        if (!query.trim()) return true
        const q = query.toLowerCase()
        return (item.title || '').toLowerCase().includes(q)
            || (item.category || '').toLowerCase().includes(q)
            || (item.description || '').toLowerCase().includes(q)
    })

    const lostCount = items.filter(i => i.status !== 'resolved').length
    const foundCount = items.filter(i => i.status === 'resolved').length

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

            {error && (
                <div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: 'rgba(251,113,133,0.15)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
                    ⚠️ {error}
                </div>
            )}

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
                                    <button type="button" onClick={() => setItemType('found')}
                                        style={{
                                            padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
                                            background: itemType === 'found' ? 'linear-gradient(135deg,#34d399,#06b6d4)' : 'transparent',
                                            color: itemType === 'found' ? '#fff' : 'var(--text-muted)'
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
                                            <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                                                style={{
                                                    padding: '0.5rem 0.25rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: category === cat.value ? '2px solid var(--accent-violet)' : '1px solid var(--glass-border)',
                                                    background: category === cat.value ? cat.color : 'transparent',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.7rem',
                                                    fontWeight: category === cat.value ? 600 : 400,
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

                                {/* Image Upload */}
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files[0]
                                            if (!file) return
                                            if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB'); return }
                                            setImageFile(file)
                                            setImagePreview(URL.createObjectURL(file))
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn-ghost"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >📷 Add Photo</button>
                                    {imagePreview && (
                                        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '0.75rem' }}>
                                            <img src={imagePreview} alt="Preview" style={{ maxHeight: 80, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }} />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); URL.revokeObjectURL(imagePreview); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-rose)', color: '#fff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >✕</button>
                                        </div>
                                    )}
                                </div>

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
                            {loading && (
                                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Loading items...</p>
                                </div>
                            )}
                            {!loading && filtered.length === 0 && (
                                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem', animation: 'float 3s ease-in-out infinite' }}>🔍</span>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>No items posted yet</h3>
                                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Report a lost or found item using the form.</p>
                                </div>
                            )}

                            {filtered.map(item => {
                                const cat = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[6]
                                const isResolved = item.status === 'resolved'
                                return (
                                    <article key={item._id} className="glass-card animate-fade-in"
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            borderLeft: '3px solid',
                                            borderImage: isResolved
                                                ? 'linear-gradient(135deg,#34d399,#06b6d4) 1'
                                                : item.type === 'lost'
                                                    ? 'linear-gradient(135deg,#fb7185,#f97316) 1'
                                                    : 'linear-gradient(135deg,#34d399,#06b6d4) 1',
                                            opacity: isResolved ? 0.65 : 1,
                                            transition: 'opacity 0.3s',
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                            {/* Left content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', textDecoration: isResolved ? 'line-through' : 'none' }}>{item.title}</h3>
                                                    <span className="badge" style={{
                                                        background: item.type === 'lost' ? 'rgba(251,113,133,0.15)' : 'rgba(52,211,153,0.15)',
                                                        color: item.type === 'lost' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                                                        fontSize: '0.65rem',
                                                    }}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span>
                                                    {isResolved && <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)', fontSize: '0.65rem' }}>✅ Resolved</span>}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span className="badge badge-glass" style={{ gap: '0.25rem' }}>{cat.icon} {cat.label}</span>
                                                    {item.location && <span className="badge badge-glass">📍 {item.location}</span>}
                                                    <span className="badge badge-glass" style={{ fontSize: '0.65rem' }}>
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p style={{ margin: '0.6rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</p>
                                                )}
                                                {item.contactInfo && (
                                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>📧 {item.contactInfo}</div>
                                                )}
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        style={{ marginTop: '0.6rem', maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--glass-border)' }}
                                                        onClick={() => window.open(item.image, '_blank')}
                                                    />
                                                )}
                                            </div>

                                            {/* Right actions */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                                                {/* Found checkmark button */}
                                                <button
                                                    onClick={() => toggleFound(item._id)}
                                                    title={isResolved ? 'Mark as still lost' : 'Mark as found'}
                                                    style={{
                                                        width: 36, height: 36,
                                                        borderRadius: 'var(--radius-full)',
                                                        border: isResolved ? '2px solid var(--accent-emerald)' : '2px solid var(--glass-border)',
                                                        background: isResolved ? 'rgba(52,211,153,0.15)' : 'transparent',
                                                        color: isResolved ? 'var(--accent-emerald)' : 'var(--text-muted)',
                                                        fontSize: '1rem',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all 0.25s',
                                                    }}
                                                >
                                                    {isResolved ? '✓' : '○'}
                                                </button>
                                                <button onClick={() => deleteItem(item._id)} className="btn-ghost btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}>
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
