import React, { useEffect, useState } from 'react'
import EventForm from '../components/EventForm'
import EventCard from '../components/EventCard'

const STORAGE_KEY = 'campus_events'

const Events = ({ onBack }) => {
	const [events, setEvents] = useState([])
	const [query, setQuery] = useState('')

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			setEvents(raw ? JSON.parse(raw) : [])
		} catch (e) { setEvents([]) }
	}, [])

	useEffect(() => {
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)) } catch (e) { }
	}, [events])

	function addEvent(ev) { setEvents(prev => [ev, ...prev]) }
	function deleteEvent(id) {
		setEvents(prev => prev.filter(e => e.id !== id))
		try { localStorage.removeItem(`campus_voted_${id}`) } catch (e) { }
	}
	function updateEvent(updated) { setEvents(prev => prev.map(e => e.id === updated.id ? updated : e)) }

	const filtered = events.filter(e => {
		if (!query.trim()) return true
		const q = query.toLowerCase()
		return (e.title || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q)
	})

	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
				<div>
					<button onClick={onBack} className="btn-ghost" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Dashboard</button>
					<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Events</h1>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Create events and poll attendees</p>
				</div>
			</header>

			<main style={{ position: 'relative', zIndex: 1 }}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

					{/* Left — Form + Tip */}
					<div>
						<EventForm onCreate={addEvent} />
						<div className="glass-card" style={{ marginTop: '1rem', padding: '1rem' }}>
							<p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
								💡 <strong style={{ color: 'var(--text-secondary)' }}>Tip:</strong> Use the poll options input to set custom RSVP choices (comma separated).
							</p>
						</div>
					</div>

					{/* Right — Event List */}
					<div>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
							<input
								value={query}
								onChange={e => setQuery(e.target.value)}
								placeholder="🔍 Search events or location..."
								className="glass-input"
								style={{ width: '60%' }}
							/>
							<span className="badge badge-violet">{events.length} events</span>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
							{filtered.length === 0 && (
								<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
									<span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📅</span>
									<p style={{ color: 'var(--text-muted)', margin: 0 }}>No events yet — create one using the form.</p>
								</div>
							)}
							{filtered.map(ev => (
								<EventCard key={ev.id} event={ev} onDelete={deleteEvent} onUpdate={updateEvent} />
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default Events
