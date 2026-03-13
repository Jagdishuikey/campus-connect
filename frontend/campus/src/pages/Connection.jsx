import React, { useEffect, useState } from 'react'
import { connectionsAPI } from '../services/api'

const Connection = ({ onBack, user }) => {
	const [connections, setConnections] = useState([])
	const [users, setUsers] = useState([])
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [searchLoading, setSearchLoading] = useState(false)
	const [error, setError] = useState('')
	const [tab, setTab] = useState('connections') // connections | search

	useEffect(() => {
		loadConnections()
	}, [])

	async function loadConnections() {
		try {
			setLoading(true)
			const data = await connectionsAPI.getAll()
			setConnections(data.connections || [])
		} catch (e) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	async function searchUsers() {
		try {
			setSearchLoading(true)
			setError('')
			const data = await connectionsAPI.getUsers(search)
			setUsers(data.users || [])
		} catch (e) {
			setError(e.message)
		} finally {
			setSearchLoading(false)
		}
	}

	async function sendRequest(recipientId) {
		try {
			setError('')
			await connectionsAPI.sendRequest(recipientId)
			await loadConnections()
			// Remove from search results
			setUsers(prev => prev.filter(u => u._id !== recipientId))
		} catch (e) {
			setError(e.message)
		}
	}

	async function updateConnection(id, status) {
		try {
			setError('')
			const data = await connectionsAPI.update(id, status)
			setConnections(prev => prev.map(c => c._id === id ? data.connection : c))
		} catch (e) {
			setError(e.message)
		}
	}

	const currentUserId = user?.id || user?._id
	const pending = connections.filter(c => c.status === 'pending' && c.recipient?._id === currentUserId)
	const sent = connections.filter(c => c.status === 'pending' && c.requester?._id === currentUserId)
	const accepted = connections.filter(c => c.status === 'accepted')

	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-header page-header-flex">
				<div>
					<button onClick={onBack} className="btn-ghost" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Dashboard</button>
					<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Connections</h1>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Find classmates and make study connections</p>
				</div>
				<div className="lf-stats">
					<div className="glass-card" style={{ padding: '0.6rem 1.2rem', textAlign: 'center', cursor: 'default' }}>
						<div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-violet)' }}>{accepted.length}</div>
						<div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connected</div>
					</div>
					<div className="glass-card" style={{ padding: '0.6rem 1.2rem', textAlign: 'center', cursor: 'default' }}>
						<div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{pending.length}</div>
						<div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pending</div>
					</div>
				</div>
			</header>

			{error && (
				<div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: 'rgba(251,113,133,0.15)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
					⚠️ {error}
				</div>
			)}

			{/* Tab Switcher */}
			<div style={{ display: 'inline-flex', background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)', padding: 3, border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
				<button type="button" onClick={() => setTab('connections')}
					style={{
						padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
						background: tab === 'connections' ? 'var(--gradient-primary)' : 'transparent',
						color: tab === 'connections' ? '#fff' : 'var(--text-muted)'
					}}>
					🔗 My Connections
				</button>
				<button type="button" onClick={() => setTab('search')}
					style={{
						padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
						background: tab === 'search' ? 'var(--gradient-primary)' : 'transparent',
						color: tab === 'search' ? '#fff' : 'var(--text-muted)'
					}}>
					🔍 Find People
				</button>
			</div>

			<main style={{ position: 'relative', zIndex: 1 }}>

				{/* === Search Tab === */}
				{tab === 'search' && (
					<div style={{ maxWidth: 600 }}>
						<div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
							<h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>🔍 Search Users</h2>
							<div style={{ display: 'flex', gap: '0.5rem' }}>
								<input
									value={search}
									onChange={e => setSearch(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && searchUsers()}
									placeholder="Search by name, email, or college..."
									className="glass-input"
									style={{ flex: 1 }}
								/>
								<button onClick={searchUsers} className="btn-gradient" disabled={searchLoading}>
									{searchLoading ? '...' : 'Search'}
								</button>
							</div>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
							{users.length === 0 && !searchLoading && (
								<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
									<span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>👤</span>
									<p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Search for users to connect with</p>
								</div>
							)}
							{users.map(u => (
								<article key={u._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem' }}>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
										<div>
											<h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{u.name}</h3>
											<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
												<span className="badge badge-glass">{u.email}</span>
												{u.college && <span className="badge badge-glass">🏫 {u.college}</span>}
											</div>
											{u.bio && <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.bio}</p>}
										</div>
										<button onClick={() => sendRequest(u._id)} className="btn-gradient" style={{ flexShrink: 0, fontSize: '0.8rem' }}>
											Connect
										</button>
									</div>
								</article>
							))}
						</div>
					</div>
				)}

				{/* === Connections Tab === */}
				{tab === 'connections' && (
					<div style={{ maxWidth: 600 }}>
						{loading && (
							<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
								<p style={{ color: 'var(--text-muted)', margin: 0 }}>Loading connections...</p>
							</div>
						)}

						{/* Pending Requests (received) */}
						{pending.length > 0 && (
							<div style={{ marginBottom: '1.5rem' }}>
								<h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>📩 Pending Requests</h2>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{pending.map(c => (
										<article key={c._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem', borderLeft: '3px solid', borderImage: 'linear-gradient(135deg,#f97316,#ec4899) 1' }}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
												<div>
													<h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{c.requester?.name}</h3>
													<span className="badge badge-glass" style={{ marginTop: '0.3rem' }}>{c.requester?.email}</span>
													{c.message && <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>"{c.message}"</p>}
												</div>
												<div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
													<button onClick={() => updateConnection(c._id, 'accepted')} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>Accept</button>
													<button onClick={() => updateConnection(c._id, 'rejected')} className="btn-ghost btn-danger" style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>Decline</button>
												</div>
											</div>
										</article>
									))}
								</div>
							</div>
						)}

						{/* Sent Requests */}
						{sent.length > 0 && (
							<div style={{ marginBottom: '1.5rem' }}>
								<h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>📤 Sent Requests</h2>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{sent.map(c => (
										<article key={c._id} className="glass-card animate-fade-in" style={{ padding: '1rem 1.5rem' }}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<div>
													<h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{c.recipient?.name}</h3>
													<span className="badge badge-glass" style={{ marginTop: '0.3rem' }}>{c.recipient?.email}</span>
												</div>
												<span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)', fontSize: '0.7rem' }}>⏳ Pending</span>
											</div>
										</article>
									))}
								</div>
							</div>
						)}

						{/* Accepted Connections */}
						{accepted.length > 0 && (
							<div style={{ marginBottom: '1.5rem' }}>
								<h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>✅ My Connections</h2>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{accepted.map(c => {
										const other = c.requester?._id === currentUserId ? c.recipient : c.requester
										return (
											<article key={c._id} className="glass-card animate-fade-in" style={{ padding: '1rem 1.5rem', borderLeft: '3px solid', borderImage: 'linear-gradient(135deg,#34d399,#06b6d4) 1' }}>
												<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
													<div>
														<h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{other?.name}</h3>
														<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
															<span className="badge badge-glass">{other?.email}</span>
															{other?.college && <span className="badge badge-glass">🏫 {other.college}</span>}
														</div>
													</div>
													<span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)', fontSize: '0.7rem' }}>🤝 Connected</span>
												</div>
											</article>
										)
									})}
								</div>
							</div>
						)}

						{!loading && connections.length === 0 && (
							<div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
								<span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>🔗</span>
								<h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>No connections yet</h3>
								<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
									Use the "Find People" tab to search for classmates and send connection requests!
								</p>
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	)
}

export default Connection
