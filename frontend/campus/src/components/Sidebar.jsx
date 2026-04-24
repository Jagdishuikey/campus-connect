import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '../store/authSlice'
import { setPage } from '../store/uiSlice'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'events', icon: '📅', label: 'Events' },
  { id: 'groups', icon: '👥', label: 'Groups' },
  { id: 'connections', icon: '🔗', label: 'Connections' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'lostfound', icon: '🔍', label: 'Lost & Found' },
  { id: 'hostels', icon: '🏘️', label: 'PG/Hostels' },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const user = useSelector(state => state.auth.user)
  const page = useSelector(state => state.ui.page)
  const dispatch = useDispatch()

  const navigate = (p) => dispatch(setPage(p))
  const signOut = () => dispatch(clearUser())

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '👤'

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigate('dashboard')}>
          <div className="sidebar-brand-icon">🎓</div>
          {!collapsed && <span className="sidebar-brand-text">Campus Connect</span>}
        </div>

        {/* Collapse Toggle */}
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${page === item.id ? 'sidebar-nav-active' : ''}`}
              onClick={() => navigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
              {page === item.id && <span className="sidebar-active-indicator" />}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <ThemeToggle />

          {/* Profile */}
          <button
            className={`sidebar-nav-item sidebar-profile-btn ${page === 'profile' ? 'sidebar-nav-active' : ''}`}
            onClick={() => navigate('profile')}
            title={collapsed ? 'Profile' : undefined}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name || 'Profile'} className="sidebar-avatar-img" />
            ) : (
              <span className="sidebar-avatar-initials">{initials}</span>
            )}
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name || 'User'}</span>
                <span className="sidebar-user-email">{user?.email || ''}</span>
              </div>
            )}
          </button>

          {/* Sign Out */}
          <button
            className="sidebar-nav-item sidebar-signout"
            onClick={signOut}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <span className="sidebar-nav-icon">🚪</span>
            {!collapsed && <span className="sidebar-nav-label">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Bottom Tab Bar ─── */}
      <nav className="mobile-tabbar">
        {navItems.slice(0, 5).map(item => (
          <button
            key={item.id}
            className={`mobile-tab ${page === item.id ? 'mobile-tab-active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="mobile-tab-icon">{item.icon}</span>
            <span className="mobile-tab-label">{item.label}</span>
          </button>
        ))}
        <button
          className={`mobile-tab ${page === 'profile' ? 'mobile-tab-active' : ''}`}
          onClick={() => navigate('profile')}
        >
          <span className="mobile-tab-icon">👤</span>
          <span className="mobile-tab-label">Profile</span>
        </button>
      </nav>
    </>
  )
}

export default Sidebar
