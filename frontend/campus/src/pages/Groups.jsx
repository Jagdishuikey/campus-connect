import React, { useEffect, useState } from 'react'
import ClubForm from '../components/ClubForm'
import ClubCard from '../components/ClubCard'

const STORAGE_KEY = 'campus_clubs'

const Groups = ({ onBack }) => {
	const [clubs, setClubs] = useState([])
	const [query, setQuery] = useState('')

	useEffect(() => {
		try { const raw = localStorage.getItem(STORAGE_KEY); setClubs(raw ? JSON.parse(raw) : []) } catch (e) { setClubs([]) }
	}, [])

	useEffect(() => {
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clubs)) } catch (e) { }
	}, [clubs])

	function addClub(c) { setClubs(prev => [c, ...prev]) }
	function deleteClub(id) { setClubs(prev => prev.filter(c => c.id !== id)); try { localStorage.removeItem(`campus_club_rated_${id}`) } catch (e) { } }
	function updateClub(updated) { setClubs(prev => prev.map(c => c.id === updated.id ? updated : c)) }

	const filtered = clubs.filter(c => {
		if (!query.trim()) return true
		const q = query.toLowerCase()
		return (c.name || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)
	})

	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
				<div>
					<button onClick={onBack} className="btn-ghost" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Dashboard</button>
					<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Groups</h1>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Student clubs and communities</p>
				</div>
			</header>

			<main style={{ position: 'relative', zIndex: 1 }}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

					{/* Left — Form + Help */}
					<div>
						<ClubForm onCreate={addClub} />
						<div className="glass-card" style={{ marginTop: '1rem', padding: '1rem' }}>
							<p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
								ℹ️ Add clubs with name, category, admin, college, members and description. Visitors can rate clubs out of 5.
							</p>
						</div>
					</div>

					{/* Right — Club List */}
					<div>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
							<input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search clubs or category..." className="glass-input" style={{ width: '60%' }} />
							<span className="badge badge-cyan">{clubs.length} clubs</span>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
							{filtered.length === 0 && (
								<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
									<span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>👥</span>
									<p style={{ color: 'var(--text-muted)', margin: 0 }}>No clubs yet — add one using the form.</p>
								</div>
							)}
							{filtered.map(club => (
								<ClubCard key={club.id} club={club} onDelete={deleteClub} onRate={updateClub} />
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default Groups
