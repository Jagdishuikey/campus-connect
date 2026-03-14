import React, { useState, useEffect, useCallback } from 'react'
import { postsAPI } from '../services/api'
import { getSocket } from '../services/socket'

/* ── Relative time helper ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ── Single activity card ── */
const ActivityItem = ({ a, currentUserId, onDelete }) => (
  <div className="glass-card animate-fade-in" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
    <div className="avatar avatar-md">{a.avatar}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{a.authorName}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(a.createdAt)}</span>
          {/* Only the author can delete their own post */}
          {(a.author === currentUserId) && (
            <button
              onClick={() => { if (window.confirm('Delete this post?')) onDelete(a._id) }}
              className="btn-ghost btn-danger"
              aria-label={`Delete post ${a._id}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
            >Delete</button>
          )}
        </div>
      </div>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.text}</p>
    </div>
  </div>
)

/* ── Main Activity feed ── */
const Activity = ({ user }) => {
  const [items, setItems] = useState([])
  const [newText, setNewText] = useState('')
  const [posting, setPosting] = useState(false)

  const currentUserId = user?.id || user?._id

  /* Fetch existing posts on mount */
  useEffect(() => {
    postsAPI.getAll()
      .then(data => setItems(data.posts || []))
      .catch(err => console.error('Failed to load posts:', err))
  }, [])

  /* Subscribe to real-time socket events */
  useEffect(() => {
    const socket = getSocket()

    const handleNewPost = (post) => {
      setItems(prev => {
        // Avoid duplicates (the author's own POST response already added it)
        if (prev.some(p => p._id === post._id)) return prev
        return [post, ...prev]
      })
    }

    const handleDeletePost = ({ postId }) => {
      setItems(prev => prev.filter(p => p._id !== postId))
    }

    socket.on('new_post', handleNewPost)
    socket.on('delete_post', handleDeletePost)

    return () => {
      socket.off('new_post', handleNewPost)
      socket.off('delete_post', handleDeletePost)
    }
  }, [])

  /* Create a post */
  const post = useCallback(async () => {
    if (!newText.trim() || posting) return
    setPosting(true)
    try {
      const data = await postsAPI.create(newText)
      // Optimistically add it (socket will also broadcast, but we de-dup above)
      setItems(prev => {
        if (prev.some(p => p._id === data.post._id)) return prev
        return [data.post, ...prev]
      })
      setNewText('')
    } catch (err) {
      console.error('Failed to create post:', err)
      alert('Could not create post. Please try again.')
    } finally {
      setPosting(false)
    }
  }, [newText, posting])

  /* Delete a post */
  const remove = useCallback(async (id) => {
    try {
      await postsAPI.delete(id)
      setItems(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Could not delete post.')
    }
  }, [])

  return (
    <div>
      {/* Post Composer */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.875rem' }}>
          <div className="avatar avatar-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
            {user?.name
              ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              rows={3}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Share an update with your campus..."
              className="glass-input"
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Add photos, links, or tags</span>
              <button
                onClick={post}
                disabled={posting || !newText.trim()}
                className="btn-gradient"
                style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem', opacity: posting ? 0.6 : 1 }}
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem' }}>
            No posts yet. Be the first to share something!
          </p>
        )}
        {items.map(a => (
          <ActivityItem key={a._id} a={a} currentUserId={currentUserId} onDelete={remove} />
        ))}
      </div>
    </div>
  )
}

export default Activity
