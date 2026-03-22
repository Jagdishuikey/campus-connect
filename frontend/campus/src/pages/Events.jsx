import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import EventForm from '../components/EventForm'
import EventCard from '../components/EventCard'
import { eventsAPI } from '../services/api'
import { setPage } from '../store/uiSlice'

const Events = () => {
	const dispatch = useDispatch()
	const onBack = () => dispatch(setPage('dashboard'))
	const [events, setEvents] = useState([])
	const [query, setQuery] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		loadEvents()
	}, [])

	async function loadEvents() {
		try {
			setLoading(true)
			const data = await eventsAPI.getAll()
			setEvents(data.events || [])
		} catch (e) {
			setError(e.message)
			console.error('Load events error:', e)
		} finally {
			setLoading(false)
		}
	}

	async function addEvent(ev) {
		try {
			setError('')
			const data = await eventsAPI.create(ev)
			setEvents(prev => [data.event, ...prev])
		} catch (e) {
			setError(e.message)
		}
	}

	async function deleteEvent(id) {
		try {
			setError('')
			await eventsAPI.delete(id)
			setEvents(prev => prev.filter(e => e._id !== id))
		} catch (e) {
			setError(e.message)
		}
	}

	async function updateEvent(updated) {
		try {
			setError('')
			const data = await eventsAPI.update(updated._id, updated)
			setEvents(prev => prev.map(e => e._id === data.event._id ? data.event : e))
		} catch (e) {
			setError(e.message)
		}
	}

	const filtered = events.filter(e => {
		if (!query.trim()) return true
		const q = query.toLowerCase()
		return (e.title || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q)
	})

	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-header page-header-flex">
				<div>
					<button onClick={onBack} className="btn-ghost" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Dashboard</button>
					<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Events</h1>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Create events and poll attendees</p>
				</div>
			</header>

			{error && (
				<div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: 'rgba(251,113,133,0.15)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
					⚠️ {error}
				</div>
			)}

			<main style={{ position: 'relative', zIndex: 1 }}>
				<div className="grid-form-list">

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
						<div className="search-filter-row">
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
							{loading && (
								<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
									<p style={{ color: 'var(--text-muted)', margin: 0 }}>Loading events...</p>
								</div>
							)}
							{!loading && filtered.length === 0 && (
								<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
									<span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📅</span>
									<p style={{ color: 'var(--text-muted)', margin: 0 }}>No events yet — create one using the form.</p>
								</div>
							)}
							{filtered.map(ev => (
								<EventCard key={ev._id} event={ev} onDelete={deleteEvent} onUpdate={updateEvent} />
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default Events
