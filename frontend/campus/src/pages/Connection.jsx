import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { connectionsAPI } from '../services/api'
import { connectSocket, getSocket } from '../services/socket'
import { setPage } from '../store/uiSlice'

const Connection = ({ initialTab = 'people' }) => {
	const user = useSelector(state => state.auth.user)
	const dispatch = useDispatch()
	const onBack = () => dispatch(setPage('dashboard'))
	const [connections, setConnections] = useState([])
	const [allUsers, setAllUsers] = useState([])
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [usersLoading, setUsersLoading] = useState(true)
	const [error, setError] = useState('')
	const [tab, setTab] = useState(initialTab) // people | connections | chat
	const [chatUser, setChatUser] = useState(null)
	const [messages, setMessages] = useState([])
	const [msgInput, setMsgInput] = useState('')
	const [chatLoading, setChatLoading] = useState(false)
	const [sendingMsg, setSendingMsg] = useState(false)
	const [isTyping, setIsTyping] = useState(false)
	const [onlineUserIds, setOnlineUserIds] = useState(new Set())
	const [chatImage, setChatImage] = useState(null)
	const [chatImagePreview, setChatImagePreview] = useState(null)
	const chatEndRef = useRef(null)
	const typingTimeoutRef = useRef(null)
	const chatImageRef = useRef(null)

	const currentUserId = user?.id || user?._id

	// Connect socket on mount
	useEffect(() => {
		if (!currentUserId) return
		const socket = connectSocket(currentUserId)

		// Listen for real-time messages
		socket.on('receive_message', (message) => {
			setMessages(prev => [...prev, message])
		})

		// Listen for typing indicators
		socket.on('user_typing', ({ senderId }) => {
			if (chatUser && (chatUser._id === senderId)) {
				setIsTyping(true)
			}
		})

		socket.on('user_stop_typing', ({ senderId }) => {
			if (chatUser && (chatUser._id === senderId)) {
				setIsTyping(false)
			}
		})

		// Track online status
		socket.on('user_online', (userId) => {
			setOnlineUserIds(prev => new Set([...prev, userId]))
		})

		socket.on('user_offline', (userId) => {
			setOnlineUserIds(prev => {
				const next = new Set(prev)
				next.delete(userId)
				return next
			})
		})

		// New connection request notification
		socket.on('new_connection_request', () => {
			loadData()
		})

		return () => {
			socket.off('receive_message')
			socket.off('user_typing')
			socket.off('user_stop_typing')
			socket.off('user_online')
			socket.off('user_offline')
			socket.off('new_connection_request')
		}
	}, [currentUserId, chatUser])

	// Auto-scroll chat on new messages
	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
		}
	}, [messages, isTyping])

	// Load initial data
	useEffect(() => {
		loadData()
	}, [])

	async function loadData() {
		try {
			setLoading(true)
			setUsersLoading(true)
			const [connData, userData] = await Promise.all([
				connectionsAPI.getAll(),
				connectionsAPI.getUsers('')
			])
			setConnections(connData.connections || [])
			setAllUsers(userData.users || [])
		} catch (e) {
			setError(e.message)
		} finally {
			setLoading(false)
			setUsersLoading(false)
		}
	}

	async function searchPeople() {
		try {
			setUsersLoading(true)
			setError('')
			const data = await connectionsAPI.getUsers(search)
			setAllUsers(data.users || [])
		} catch (e) {
			setError(e.message)
		} finally {
			setUsersLoading(false)
		}
	}

	async function sendRequest(recipientId) {
		try {
			setError('')
			await connectionsAPI.sendRequest(recipientId)
			// Notify recipient in real-time
			const socket = getSocket()
			if (socket?.connected) {
				socket.emit('connection_request', { recipientId, senderName: user?.name })
			}
			const [connData, userData] = await Promise.all([
				connectionsAPI.getAll(),
				connectionsAPI.getUsers(search)
			])
			setConnections(connData.connections || [])
			setAllUsers(userData.users || [])
		} catch (e) {
			setError(e.message)
		}
	}

	async function updateConnection(id, status) {
		try {
			setError('')
			await connectionsAPI.update(id, status)
			const [connData, userData] = await Promise.all([
				connectionsAPI.getAll(),
				connectionsAPI.getUsers(search)
			])
			setConnections(connData.connections || [])
			setAllUsers(userData.users || [])
		} catch (e) {
			setError(e.message)
		}
	}

	async function openChat(otherUser) {
		setChatUser(otherUser)
		setTab('chat')
		setChatLoading(true)
		setIsTyping(false)
		try {
			const data = await connectionsAPI.getMessages(otherUser._id)
			setMessages(data.messages || [])
		} catch (e) {
			setError(e.message)
		} finally {
			setChatLoading(false)
		}
	}

	const handleTyping = useCallback(() => {
		if (!chatUser) return
		const socket = getSocket()
		if (socket?.connected) {
			socket.emit('typing', { recipientId: chatUser._id, senderId: currentUserId })
			clearTimeout(typingTimeoutRef.current)
			typingTimeoutRef.current = setTimeout(() => {
				socket.emit('stop_typing', { recipientId: chatUser._id, senderId: currentUserId })
			}, 1500)
		}
	}, [chatUser, currentUserId])

	async function handleSendMessage(e) {
		e.preventDefault()
		if ((!msgInput.trim() && !chatImage) || !chatUser) return
		try {
			setSendingMsg(true)
			const data = await connectionsAPI.sendMessage(chatUser._id, msgInput.trim() || null, chatImage)
			setMessages(prev => [...prev, data.message])
			// Emit via socket for real-time delivery
			const socket = getSocket()
			if (socket?.connected) {
				socket.emit('send_message', { recipientId: chatUser._id, message: { ...data.message, senderName: user?.name || 'Someone' } })
				socket.emit('stop_typing', { recipientId: chatUser._id, senderId: currentUserId })
			}
			setMsgInput('')
			clearChatImage()
		} catch (e) {
			setError(e.message)
		} finally {
			setSendingMsg(false)
		}
	}

	function clearChatImage() {
		setChatImage(null)
		if (chatImagePreview) URL.revokeObjectURL(chatImagePreview)
		setChatImagePreview(null)
		if (chatImageRef.current) chatImageRef.current.value = ''
	}

	const pending = connections.filter(c => c.status === 'pending' && c.recipient?._id === currentUserId)
	const sent = connections.filter(c => c.status === 'pending' && c.requester?._id === currentUserId)
	const accepted = connections.filter(c => c.status === 'accepted')

	function getStatusBadge(u) {
		if (u.connectionStatus === 'accepted') return { text: '🤝 Connected', bg: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)' }
		if (u.connectionStatus === 'pending' && u.isRequester) return { text: '⏳ Sent', bg: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)' }
		if (u.connectionStatus === 'pending' && !u.isRequester) return { text: '📩 Accept?', bg: 'rgba(249,115,22,0.15)', color: '#f97316' }
		if (u.connectionStatus === 'rejected') return { text: '❌ Declined', bg: 'rgba(251,113,133,0.1)', color: 'var(--text-muted)' }
		return null
	}

	function isOnline(userId) {
		return onlineUserIds.has(userId)
	}

	const tabStyle = (t) => ({
		padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s',
		background: tab === t ? 'var(--gradient-primary)' : 'transparent',
		color: tab === t ? '#fff' : 'var(--text-muted)'
	})

	// Online dot indicator
	const OnlineDot = ({ userId, size = 10 }) => (
		<span style={{
			width: size, height: size, borderRadius: '50%',
			background: isOnline(userId) ? '#22c55e' : '#6b7280',
			display: 'inline-block', flexShrink: 0,
			boxShadow: isOnline(userId) ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
			border: `2px solid var(--glass-bg)`,
		}} title={isOnline(userId) ? 'Online' : 'Offline'} />
	)

	return (
		<div className="page-wrapper">
			{/* Header */}
			<header className="page-title-section animate-fade-in">
				<div className="page-title-row">
					<div>
						<div className="page-icon">🔗</div>
						<h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }} className="gradient-text">Connections</h1>
						<p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>Find classmates, connect & chat in real-time</p>
					</div>
					<div className="lf-stats">
						<div className="glass-card" style={{ padding: '0.6rem 1.2rem', textAlign: 'center', cursor: 'default' }}>
							<div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-violet)' }}>{accepted.length}</div>
							<div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connected</div>
						</div>
						<div className="glass-card" style={{ padding: '0.6rem 1.2rem', textAlign: 'center', cursor: 'default' }}>
							<div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{pending.length}</div>
							<div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requests</div>
						</div>
					</div>
				</div>
			</header>

			{error && (
				<div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: 'rgba(251,113,133,0.15)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
					⚠️ {error}
					<button onClick={() => setError('')} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
				</div>
			)}

			{/* Tab Switcher */}
			<div style={{ display: 'inline-flex', background: 'var(--glass-bg)', borderRadius: 'var(--radius-full)', padding: 3, border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
				<button type="button" onClick={() => setTab('people')} style={tabStyle('people')}>👥 All People</button>
				<button type="button" onClick={() => setTab('connections')} style={tabStyle('connections')}>
					🔗 My Connections
					{pending.length > 0 && <span style={{ marginLeft: 6, background: 'var(--accent-rose)', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{pending.length}</span>}
				</button>
				{chatUser && <button type="button" onClick={() => setTab('chat')} style={tabStyle('chat')}>💬 Chat</button>}
			</div>

			<main style={{ position: 'relative', zIndex: 1 }}>

				{/* ============ ALL PEOPLE TAB ============ */}
				{tab === 'people' && (
					<div>
						<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', maxWidth: 500 }}>
							<input
								value={search}
								onChange={e => setSearch(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && searchPeople()}
								placeholder="🔍 Search by name, email, or college..."
								className="glass-input"
								style={{ flex: 1 }}
							/>
							<button onClick={searchPeople} className="btn-gradient" disabled={usersLoading}>
								{usersLoading ? '...' : 'Search'}
							</button>
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
							{usersLoading && (
								<>
									{[1,2,3].map(i => (
										<div key={i} className="skeleton-card">
											<div className="skeleton-row"><div className="skeleton skeleton-circle" /><div style={{flex:1,display:'flex',flexDirection:'column',gap:'0.4rem'}}><div className="skeleton skeleton-line-lg" /><div className="skeleton skeleton-line-sm" /></div></div>
										</div>
									))}
								</>
							)}
							{!usersLoading && allUsers.length === 0 && (
								<div className="glass-card empty-state">
									<span className="empty-state-icon">👤</span>
									<h3 className="empty-state-title">No users found</h3>
									<p className="empty-state-desc">Try a different search term to find classmates.</p>
								</div>
							)}
							{allUsers.map(u => {
								const status = getStatusBadge(u)
								const isConnected = u.connectionStatus === 'accepted'
								const canConnect = !u.connectionStatus
								const isPendingReceived = u.connectionStatus === 'pending' && !u.isRequester
								return (
									<article key={u._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem' }}>
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
											<div style={{ flex: 1, minWidth: 200 }}>
												<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
													<OnlineDot userId={u._id} />
													<h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{u.name}</h3>
													{status && <span className="badge" style={{ background: status.bg, color: status.color, fontSize: '0.65rem' }}>{status.text}</span>}
												</div>
												<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
													<span className="badge badge-glass" style={{ fontSize: '0.72rem' }}>📧 {u.email}</span>
													{u.college && <span className="badge badge-glass" style={{ fontSize: '0.72rem' }}>🏫 {u.college}</span>}
												</div>
												{u.bio && <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{u.bio}</p>}
											</div>
											<div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
												{canConnect && (
													<button onClick={() => sendRequest(u._id)} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem' }}>
														🔗 Connect
													</button>
												)}
												{isPendingReceived && (
													<>
														<button onClick={() => updateConnection(u.connectionId, 'accepted')} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>Accept</button>
														<button onClick={() => updateConnection(u.connectionId, 'rejected')} className="btn-ghost btn-danger" style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>Decline</button>
													</>
												)}
												{isConnected && (
													<button onClick={() => openChat(u)} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
														💬 Chat
													</button>
												)}
											</div>
										</div>
									</article>
								)
							})}
						</div>
					</div>
				)}

				{/* ============ MY CONNECTIONS TAB ============ */}
				{tab === 'connections' && (
					<div style={{ maxWidth: 650 }}>
						{loading && (
							<div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
								<p style={{ color: 'var(--text-muted)', margin: 0 }}>Loading connections...</p>
							</div>
						)}

						{pending.length > 0 && (
							<div style={{ marginBottom: '1.5rem' }}>
								<h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>📩 Incoming Requests</h2>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{pending.map(c => (
										<article key={c._id} className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem', borderLeft: '3px solid', borderImage: 'linear-gradient(135deg,#f97316,#ec4899) 1' }}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
												<div>
													<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
														<OnlineDot userId={c.requester?._id} />
														<h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{c.requester?.name}</h3>
													</div>
													<div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
														<span className="badge badge-glass">{c.requester?.email}</span>
														{c.requester?.college && <span className="badge badge-glass">🏫 {c.requester.college}</span>}
													</div>
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

						{sent.length > 0 && (
							<div style={{ marginBottom: '1.5rem' }}>
								<h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>📤 Sent Requests</h2>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{sent.map(c => (
										<article key={c._id} className="glass-card animate-fade-in" style={{ padding: '1rem 1.5rem' }}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<div>
													<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
														<OnlineDot userId={c.recipient?._id} />
														<h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{c.recipient?.name}</h3>
													</div>
													<span className="badge badge-glass" style={{ marginTop: '0.3rem' }}>{c.recipient?.email}</span>
												</div>
												<span className="badge" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)', fontSize: '0.7rem' }}>⏳ Pending</span>
											</div>
										</article>
									))}
								</div>
							</div>
						)}

						{accepted.length > 0 && (
							<div style={{ marginBottom: '1.5rem' }}>
								<h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>✅ Connected ({accepted.length})</h2>
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{accepted.map(c => {
										const other = c.requester?._id === currentUserId ? c.recipient : c.requester
										return (
											<article key={c._id} className="glass-card animate-fade-in" style={{ padding: '1rem 1.5rem', borderLeft: '3px solid', borderImage: 'linear-gradient(135deg,#34d399,#06b6d4) 1' }}>
												<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
													<div>
														<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
															<OnlineDot userId={other?._id} />
															<h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{other?.name}</h3>
															{isOnline(other?._id) && <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>Online</span>}
														</div>
														<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
															<span className="badge badge-glass">{other?.email}</span>
															{other?.college && <span className="badge badge-glass">🏫 {other.college}</span>}
														</div>
													</div>
													<button onClick={() => openChat(other)} className="btn-gradient" style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', flexShrink: 0, background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}>
														💬 Chat
													</button>
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
									Go to "All People" tab to find and connect with classmates!
								</p>
							</div>
						)}
					</div>
				)}

				{/* ============ CHAT TAB ============ */}
				{tab === 'chat' && chatUser && (
					<div style={{ maxWidth: 650 }}>
						{/* Chat Header */}
						<div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
								<div style={{ position: 'relative' }}>
									<div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
										{chatUser.name?.charAt(0)?.toUpperCase() || '?'}
									</div>
									<span style={{
										position: 'absolute', bottom: 0, right: 0,
										width: 12, height: 12, borderRadius: '50%',
										background: isOnline(chatUser._id) ? '#22c55e' : '#6b7280',
										border: '2px solid var(--card-bg)',
										boxShadow: isOnline(chatUser._id) ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
									}} />
								</div>
								<div>
									<h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{chatUser.name}</h3>
									<span style={{ fontSize: '0.75rem', color: isOnline(chatUser._id) ? '#22c55e' : 'var(--text-muted)' }}>
										{isOnline(chatUser._id) ? '● Online' : '○ Offline'}
									</span>
								</div>
							</div>
							<button onClick={() => setTab('people')} className="btn-ghost" style={{ fontSize: '0.8rem' }}>✕ Close</button>
						</div>

						{/* Messages Area */}
						<div className="glass-card" style={{
							padding: '1rem',
							height: 400,
							overflowY: 'auto',
							display: 'flex',
							flexDirection: 'column',
							gap: '0.5rem',
							marginBottom: '0.75rem',
						}}>
							{chatLoading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>Loading messages...</p>}

							{!chatLoading && messages.length === 0 && (
								<div style={{ margin: 'auto', textAlign: 'center', padding: '2rem 0' }}>
									<span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>💬</span>
									<p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No messages yet — say hello!</p>
								</div>
							)}

							{messages.map((msg, i) => {
								const isMine = (msg.sender?._id || msg.sender) === currentUserId
								return (
									<div key={msg._id || i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
										<div style={{
											padding: '0.6rem 1rem',
											borderRadius: isMine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
											background: isMine ? 'linear-gradient(135deg,#8b5cf6,#06b6d4)' : 'var(--glass-bg)',
											border: isMine ? 'none' : '1px solid var(--glass-border)',
											color: isMine ? '#fff' : 'var(--text-primary)',
											fontSize: '0.88rem',
											lineHeight: 1.5,
										}}>
											{msg.content && <span>{msg.content}</span>}
										{msg.image && (
											<img
												src={msg.image}
												alt="Shared image"
												style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-md)', marginTop: msg.content ? '0.4rem' : 0, cursor: 'pointer', display: 'block' }}
												onClick={() => window.open(msg.image, '_blank')}
											/>
										)}
										</div>
										<div style={{
											fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem',
											textAlign: isMine ? 'right' : 'left',
											paddingLeft: isMine ? 0 : '0.5rem',
											paddingRight: isMine ? '0.5rem' : 0,
										}}>
											{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</div>
									</div>
								)
							})}

							{/* Typing indicator */}
							{isTyping && (
								<div style={{ alignSelf: 'flex-start', maxWidth: '75%' }}>
									<div style={{
										padding: '0.5rem 1rem',
										borderRadius: '1rem 1rem 1rem 0.25rem',
										background: 'var(--glass-bg)',
										border: '1px solid var(--glass-border)',
										color: 'var(--text-muted)',
										fontSize: '0.85rem',
									}}>
										<span className="typing-dots">
											<span style={{ animation: 'blink 1.4s infinite both', animationDelay: '0s' }}>●</span>
											<span style={{ animation: 'blink 1.4s infinite both', animationDelay: '0.2s' }}>●</span>
											<span style={{ animation: 'blink 1.4s infinite both', animationDelay: '0.4s' }}>●</span>
										</span>
									</div>
								</div>
							)}

							<div ref={chatEndRef} />
						</div>

						{/* Message Input */}
						{chatImagePreview && (
							<div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.5rem' }}>
								<img src={chatImagePreview} alt="Preview" style={{ maxHeight: 80, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }} />
								<button
									onClick={clearChatImage}
									style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-rose)', color: '#fff', border: 'none', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
								>✕</button>
							</div>
						)}
						<form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
							<input
								ref={chatImageRef}
								type="file"
								accept="image/*"
								onChange={e => {
									const file = e.target.files[0]
									if (!file) return
									if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB'); return }
									setChatImage(file)
									setChatImagePreview(URL.createObjectURL(file))
								}}
								style={{ display: 'none' }}
							/>
							<button
								type="button"
								onClick={() => chatImageRef.current?.click()}
								className="btn-ghost"
								style={{ padding: '0.5rem 0.6rem', fontSize: '1rem', flexShrink: 0 }}
								title="Attach image"
							>📎</button>
							<input
								value={msgInput}
								onChange={e => { setMsgInput(e.target.value); handleTyping() }}
								placeholder="Type a message..."
								className="glass-input"
								style={{ flex: 1 }}
								autoFocus
							/>
							<button type="submit" className="btn-gradient" disabled={sendingMsg || (!msgInput.trim() && !chatImage)} style={{ padding: '0.5rem 1.2rem' }}>
								{sendingMsg ? '...' : '📩 Send'}
							</button>
						</form>
					</div>
				)}
			</main>

			{/* Typing animation keyframes */}
			<style>{`
				@keyframes blink {
					0% { opacity: 0.2; }
					20% { opacity: 1; }
					100% { opacity: 0.2; }
				}
			`}</style>
		</div>
	)
}

export default Connection
