import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ThemeToggle from '../components/ThemeToggle'
import { authAPI } from '../services/api'
import { updateUser, clearUser } from '../store/authSlice'
import { setPage } from '../store/uiSlice'

const ProfilePage = () => {
    const user = useSelector(state => state.auth.user)
    const dispatch = useDispatch()
    const onBack = () => dispatch(setPage('dashboard'))
    const onSignOut = () => dispatch(clearUser())
    const [activeTab, setActiveTab] = useState('about')
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        college: '',
        phone: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [saveSuccess, setSaveSuccess] = useState(false)

    const name = user?.name || 'Campus User'
    const email = user?.email || ''
    const college = user?.college || 'Not specified'
    const phone = user?.phone || 'Not specified'
    const bio = user?.bio || 'Hey there! I\'m using Campus Connect to stay connected with my campus community. 🎓'
    const joinedGroups = user?.joinedGroups?.length || 0
    const subscribedEvents = user?.subscribedEvents?.length || 0
    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'Recently'

    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const stats = [
        { icon: '👥', label: 'Groups', value: joinedGroups, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))' },
        { icon: '📅', label: 'Events', value: subscribedEvents, gradient: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(236,72,153,0.1))' },
        { icon: '⭐', label: 'Member Since', value: memberSince, gradient: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(6,182,212,0.1))' },
    ]

    const detailItems = [
        { icon: '✉️', label: 'Email', value: email },
        { icon: '📱', label: 'Phone', value: phone },
        { icon: '🏫', label: 'College', value: college },
        { icon: '🟢', label: 'Status', value: 'Active' },
    ]

    // Open edit modal and pre-fill with current user data
    const openEditModal = () => {
        setEditForm({
            name: user?.name || '',
            bio: user?.bio || '',
            college: user?.college || '',
            phone: user?.phone || '',
        })
        setImageFile(null)
        setImagePreview(user?.profileImage || null)
        setSaveError('')
        setSaveSuccess(false)
        setIsEditing(true)
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            setSaveError('Image must be under 5 MB')
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        setSaveError('')
    }

    const closeEditModal = () => {
        setIsEditing(false)
        setSaveError('')
        setSaveSuccess(false)
    }

    const handleFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        // Basic validation
        if (!editForm.name.trim()) {
            setSaveError('Name is required')
            return
        }
        if (editForm.name.trim().length < 2) {
            setSaveError('Name must be at least 2 characters')
            return
        }

        setSaving(true)
        setSaveError('')
        try {
            const response = await authAPI.updateProfile({
                name: editForm.name.trim(),
                bio: editForm.bio.trim(),
                college: editForm.college.trim(),
                phone: editForm.phone.trim(),
            }, imageFile)

            if (response.success && response.user) {
                // Merge updates into existing user to preserve fields like joinedGroups
                const updatedUser = { ...user, ...response.user }
                dispatch(updateUser(response.user))
                setSaveSuccess(true)
                setTimeout(() => {
                    closeEditModal()
                }, 1200)
            }
        } catch (err) {
            setSaveError(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="page-wrapper">
            {/* Floating decorative orbs */}
            <div className="profile-orb profile-orb-1" />
            <div className="profile-orb profile-orb-2" />
            <div className="profile-orb profile-orb-3" />

            {/* Header bar */}
            <header className="dashboard-header">
                <button onClick={onBack} className="btn-ghost" style={{ gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>←</span> Back
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ThemeToggle />
                </div>
            </header>

            <main style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
                {/* ─── Hero Profile Card ─── */}
                <section className="profile-hero-card glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Banner Gradient */}
                    <div className="profile-banner">
                        <div className="profile-banner-pattern" />
                    </div>

                    {/* Avatar + Info */}
                    <div className="profile-hero-content">
                        <div className="profile-avatar-xl-wrapper">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt={name} className="profile-avatar-xl profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-xl">
                                    {initials}
                                </div>
                            )}
                            <div className="profile-status-dot" />
                        </div>

                        <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, margin: '1rem 0 0.25rem' }}>
                            {name}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            {email}
                        </p>

                        {college && college !== 'Not specified' && (
                            <span className="badge badge-glass" style={{ marginTop: '0.75rem', gap: '0.35rem' }}>
                                🏫 {college}
                            </span>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button className="btn-gradient" style={{ gap: '0.4rem' }} onClick={openEditModal}>
                                ✏️ Edit Profile
                            </button>
                            <button className="btn-ghost" style={{ gap: '0.4rem' }}>
                                🔗 Share Profile
                            </button>
                        </div>
                    </div>
                </section>

                {/* ─── Stats Row ─── */}
                <section className="profile-stats-grid animate-fade-in animate-delay-1">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="glass-card profile-stat-card"
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{ position: 'absolute', inset: 0, background: s.gradient, opacity: 0.5, pointerEvents: 'none' }} />
                            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>{s.icon}</span>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontWeight: 500 }}>
                                    {s.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* ─── Tab Navigation ─── */}
                <div className="profile-tabs animate-fade-in animate-delay-2">
                    {['about', 'details', 'activity'].map(tab => (
                        <button
                            key={tab}
                            className={`profile-tab ${activeTab === tab ? 'profile-tab-active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'about' && '📋'} {tab === 'details' && '📇'} {tab === 'activity' && '📊'}{' '}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ─── Tab Content ─── */}
                <div className="animate-fade-in animate-delay-3" key={activeTab}>
                    {activeTab === 'about' && (
                        <section className="glass-card profile-section">
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>✨</span> About Me
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>
                                {bio}
                            </p>
                        </section>
                    )}

                    {activeTab === 'details' && (
                        <section className="profile-details-grid">
                            {detailItems.map((item, i) => (
                                <div key={i} className="glass-card profile-detail-item">
                                    <div className="profile-detail-icon">{item.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {item.label}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: item.label === 'Status' ? 'var(--accent-emerald)' : 'var(--text-primary)',
                                            fontWeight: 600,
                                            marginTop: '0.2rem',
                                        }}>
                                            {item.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {activeTab === 'activity' && (
                        <section className="glass-card profile-section">
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.1rem' }}>📊</span> Recent Activity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { icon: '🎉', text: 'Joined Campus Connect', time: memberSince, color: 'var(--accent-violet)' },
                                    { icon: '👥', text: `Part of ${joinedGroups} group${joinedGroups !== 1 ? 's' : ''}`, time: 'Current', color: 'var(--accent-cyan)' },
                                    { icon: '📅', text: `Subscribed to ${subscribedEvents} event${subscribedEvents !== 1 ? 's' : ''}`, time: 'Current', color: 'var(--accent-emerald)' },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.875rem 1rem',
                                            background: 'var(--glass-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--glass-border)',
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                            background: `${item.color}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem', flexShrink: 0,
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.text}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* ─── Sign Out ─── */}
                <div className="animate-fade-in animate-delay-3" style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
                    <button onClick={onSignOut} className="btn-ghost btn-danger" style={{ gap: '0.4rem' }}>
                        🚪 Sign Out
                    </button>
                </div>
            </main>

            {/* ─── Edit Profile Modal ─── */}
            {isEditing && (
                <div className="edit-profile-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEditModal() }}>
                    <div className="edit-profile-modal animate-fade-in">
                        {/* Modal Header */}
                        <div className="edit-profile-header">
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>✏️</span>
                                <span className="gradient-text">Edit Profile</span>
                            </h2>
                            <button
                                className="edit-profile-close-btn"
                                onClick={closeEditModal}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="edit-profile-body">
                            {/* Profile Image Picker */}
                            <div className="edit-profile-image-picker">
                                <div className="edit-profile-image-preview">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : (
                                        <span className="edit-profile-image-placeholder">📷</span>
                                    )}
                                </div>
                                <div className="edit-profile-image-info">
                                    <label className="form-label" style={{ margin: 0 }}>Profile Picture</label>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem' }}>JPG, PNG or WebP. Max 5 MB.</p>
                                    <label className="btn-ghost edit-profile-upload-btn" style={{ cursor: 'pointer' }}>
                                        📁 Choose Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            </div>
                            {/* Name */}
                            <div className="edit-profile-field">
                                <label className="form-label">👤 Name</label>
                                <input
                                    className="glass-input"
                                    type="text"
                                    placeholder="Your full name"
                                    value={editForm.name}
                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                    maxLength={50}
                                />
                                <span className="edit-profile-char-count">{editForm.name.length}/50</span>
                            </div>

                            {/* Bio */}
                            <div className="edit-profile-field">
                                <label className="form-label">✨ Bio</label>
                                <textarea
                                    className="glass-input"
                                    placeholder="Tell people about yourself..."
                                    value={editForm.bio}
                                    onChange={(e) => handleFormChange('bio', e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    style={{ resize: 'vertical' }}
                                />
                                <span className="edit-profile-char-count">{editForm.bio.length}/500</span>
                            </div>

                            {/* College */}
                            <div className="edit-profile-field">
                                <label className="form-label">🏫 College</label>
                                <input
                                    className="glass-input"
                                    type="text"
                                    placeholder="Your college or university"
                                    value={editForm.college}
                                    onChange={(e) => handleFormChange('college', e.target.value)}
                                />
                            </div>

                            {/* Phone */}
                            <div className="edit-profile-field">
                                <label className="form-label">📱 Phone</label>
                                <input
                                    className="glass-input"
                                    type="tel"
                                    placeholder="Your phone number"
                                    value={editForm.phone}
                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                />
                            </div>

                            {/* Error */}
                            {saveError && (
                                <div className="edit-profile-error">
                                    ⚠️ {saveError}
                                </div>
                            )}

                            {/* Success */}
                            {saveSuccess && (
                                <div className="edit-profile-success">
                                    ✅ Profile updated successfully!
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="edit-profile-actions">
                            <button className="btn-ghost" onClick={closeEditModal} disabled={saving}>
                                Cancel
                            </button>
                            <button className="btn-gradient" onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="edit-profile-spinner" />
                                        Saving...
                                    </>
                                ) : (
                                    '💾 Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePage
