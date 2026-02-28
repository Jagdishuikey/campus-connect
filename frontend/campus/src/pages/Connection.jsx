import React from 'react'

const Connection = ({ onBack }) => {
	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-header">
				<button onClick={onBack} className="btn-ghost" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>← Back to Dashboard</button>
				<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Connections</h1>
				<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Find classmates and make study connections</p>
			</header>

			<main style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
				<div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
					<span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>🔗</span>
					<h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>No connections yet</h3>
					<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
						Start searching for classmates to make your first connection. This feature is coming soon!
					</p>
				</div>
			</main>
		</div>
	)
}

export default Connection
