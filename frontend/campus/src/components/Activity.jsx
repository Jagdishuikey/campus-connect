import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
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
const ActivityItem = ({ a, currentUserId, onDelete, onLike }) => {
  const liked = (a.likes || []).includes(currentUserId)
  const likeCount = (a.likes || []).length

  return (
    <div className="glass-card animate-fade-in" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
      <div className="avatar avatar-md">{a.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{a.authorName}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(a.createdAt)}</span>
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
        {a.text && <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.text}</p>}
        {a.image && (
          <img
            src={a.image}
            alt="Post attachment"
            style={{
              marginTop: '0.6rem',
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              cursor: 'pointer',
              border: '1px solid var(--glass-border)',
            }}
            onClick={() => window.open(a.image, '_blank')}
          />
        )}
        {/* Like count */}
        {likeCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--glass-border)' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(180deg, #18acfe, #0163e0)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>👍</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{likeCount}</span>
          </div>
        )}
        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: likeCount > 0 ? '0.25rem' : '0.5rem', borderTop: likeCount > 0 ? 'none' : '1px solid var(--glass-border)', paddingTop: '0.35rem' }}>
          <button
            onClick={() => onLike(a._id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease',
              color: liked ? '#0866ff' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: liked ? 700 : 600,
            }}
            title={liked ? 'Unlike' : 'Like'}
          >
            <span style={{
              fontSize: '1.05rem',
              transition: 'transform 0.25s ease',
              transform: liked ? 'scale(1.15)' : 'scale(1)',
              display: 'inline-block',
            }}>
              👍
            </span>
            <span>Like</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Activity feed ── */
const Activity = () => {
  const user = useSelector(state => state.auth.user)
  const [items, setItems] = useState([])
  const [newText, setNewText] = useState('')
  const [posting, setPosting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

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
        if (prev.some(p => p._id === post._id)) return prev
        return [post, ...prev]
      })
    }

    const handleDeletePost = ({ postId }) => {
      setItems(prev => prev.filter(p => p._id !== postId))
    }

    const handlePostLiked = ({ postId, likes }) => {
      setItems(prev => prev.map(p => p._id === postId ? { ...p, likes } : p))
    }

    socket.on('new_post', handleNewPost)
    socket.on('delete_post', handleDeletePost)
    socket.on('post_liked', handlePostLiked)

    return () => {
      socket.off('new_post', handleNewPost)
      socket.off('delete_post', handleDeletePost)
      socket.off('post_liked', handlePostLiked)
    }
  }, [])

  /* Handle image selection */
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* Create a post */
  const post = useCallback(async () => {
    if ((!newText.trim() && !imageFile) || posting) return
    setPosting(true)
    try {
      const data = await postsAPI.create(newText.trim() || null, imageFile)
      if (data && data.post) {
        setItems(prev => {
          if (prev.some(p => p._id === data.post._id)) return prev
          return [data.post, ...prev]
        })
        setNewText('')
        // Clean up image state safely
        setImageFile(null)
        setImagePreview(prev => { if (prev) URL.revokeObjectURL(prev); return null })
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      alert('Could not create post. Please try again.')
    } finally {
      setPosting(false)
    }
  }, [newText, imageFile, posting])

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

  /* Like / unlike a post */
  const like = useCallback(async (id) => {
    // Optimistic update
    setItems(prev => prev.map(p => {
      if (p._id !== id) return p
      const likes = [...(p.likes || [])]
      const idx = likes.indexOf(currentUserId)
      if (idx === -1) likes.push(currentUserId)
      else likes.splice(idx, 1)
      return { ...p, likes }
    }))
    try {
      await postsAPI.like(id)
    } catch (err) {
      console.error('Failed to like post:', err)
      // Revert on failure
      postsAPI.getAll()
        .then(data => setItems(data.posts || []))
        .catch(() => {})
    }
  }, [currentUserId])

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

            {/* Image Preview */}
            {imagePreview && (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '0.5rem' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxHeight: 120, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}
                />
                <button
                  onClick={clearImage}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--accent-rose)', color: '#fff',
                    border: 'none', fontSize: '0.7rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >✕</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-ghost"
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                  type="button"
                >📷 Photo</button>
              </div>
              <button
                onClick={post}
                disabled={posting || (!newText.trim() && !imageFile)}
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
          <ActivityItem key={a._id} a={a} currentUserId={currentUserId} onDelete={remove} onLike={like} />
        ))}
      </div>
    </div>
  )
}

export default Activity
