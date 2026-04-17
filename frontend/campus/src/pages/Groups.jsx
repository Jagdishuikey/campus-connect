import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ClubForm from '../components/ClubForm'
import ClubCard from '../components/ClubCard'
import { groupsAPI } from '../services/api'
import { setPage } from '../store/uiSlice'

const SkeletonCard = () => (
	<div className="skeleton-card">
		<div className="skeleton-row">
			<div className="skeleton skeleton-line-lg" />
		</div>
		<div className="skeleton-row" style={{ gap: '0.5rem' }}>
			<div className="skeleton skeleton-line-sm" style={{ width: '70px' }} />
			<div className="skeleton skeleton-line-sm" style={{ width: '90px' }} />
		</div>
		<div className="skeleton skeleton-line" style={{ width: '95%' }} />
		<div className="skeleton skeleton-line" style={{ width: '60%' }} />
		<div className="skeleton skeleton-line" style={{ width: '80%' }} />
	</div>
)

const Groups = () => {
	const user = useSelector(state => state.auth.user)
	const dispatch = useDispatch()
	const [clubs, setClubs] = useState([])
	const [query, setQuery] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		loadGroups()
	}, [])

	async function loadGroups() {
		try {
			setLoading(true)
			const data = await groupsAPI.getAll()
			setClubs(data.groups || [])
		} catch (e) {
			setError(e.message)
			console.error('Load groups error:', e)
		} finally {
			setLoading(false)
		}
	}

	async function addClub(c) {
		try {
			setError('')
			const data = await groupsAPI.create(c)
			setClubs(prev => [data.group, ...prev])
		} catch (e) {
			setError(e.message)
		}
	}

	async function deleteClub(id) {
		try {
			setError('')
			await groupsAPI.delete(id)
			setClubs(prev => prev.filter(c => c._id !== id))
		} catch (e) {
			setError(e.message)
		}
	}

	async function updateClub(updated) {
		try {
			setError('')
			const data = await groupsAPI.update(updated._id, updated)
			setClubs(prev => prev.map(c => c._id === data.group._id ? data.group : c))
		} catch (e) {
			setError(e.message)
		}
	}

	async function joinClub(id) {
		try {
			setError('')
			const data = await groupsAPI.join(id)
			setClubs(prev => prev.map(c => c._id === data.group._id ? data.group : c))
		} catch (e) {
			setError(e.message)
		}
	}

	async function leaveClub(id) {
		try {
			setError('')
			const data = await groupsAPI.leave(id)
			setClubs(prev => prev.map(c => c._id === data.group._id ? data.group : c))
		} catch (e) {
			setError(e.message)
		}
	}

	const filtered = clubs.filter(c => {
		if (!query.trim()) return true
		const q = query.toLowerCase()
		return (c.name || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q)
	})

	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-title-section animate-fade-in">
				<div className="page-title-row">
					<div>
						<div className="page-icon">👥</div>
						<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Groups</h1>
						<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Student clubs and communities</p>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<span className="badge badge-cyan">{clubs.length} clubs</span>
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
						<div className="search-filter-row">
							<input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search clubs or category..." className="glass-input" style={{ width: '60%' }} />
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
							{loading && (
								<>
									<SkeletonCard />
									<SkeletonCard />
								</>
							)}
							{!loading && filtered.length === 0 && (
								<div className="glass-card empty-state">
									<span className="empty-state-icon">👥</span>
									<h3 className="empty-state-title">No clubs yet</h3>
									<p className="empty-state-desc">Start a new club using the form on the left and invite your classmates!</p>
								</div>
							)}
							{filtered.map(club => (
								<ClubCard key={club._id} club={club} onDelete={deleteClub} onRate={updateClub} onJoin={joinClub} onLeave={leaveClub} user={user} />
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export default Groups
