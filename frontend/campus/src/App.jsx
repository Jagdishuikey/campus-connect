
import React, { useState, useEffect } from 'react'
import './App.css'
import { ThemeProvider } from './components/ThemeContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Events from './pages/Events'
import Groups from './pages/Groups'
import Connection from './pages/Connection'
import LostFound from './pages/LostFound'
import ProfilePage from './pages/ProfilePage'
import { connectSocket, disconnectSocket } from './services/socket'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Failed to parse user data:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Auto-connect socket when user is already logged in on mount
  useEffect(() => {
    if (user) {
      const userId = user.id || user._id
      if (userId) connectSocket(userId)
    }
  }, [user])

  const handleAuth = (u) => {
    setUser(u)
    setPage('dashboard')
    // Connect socket on login
    const userId = u?.id || u?._id
    if (userId) connectSocket(userId)
  }

  const signOut = () => {
    // Disconnect socket
    disconnectSocket()
    // Clear token and user from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setPage('dashboard')
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (!user) return (
    <ThemeProvider>
      <Auth onAuth={handleAuth} />
    </ThemeProvider>
  )

  return (
    <ThemeProvider>
      {page === 'dashboard' && <Dashboard user={user} onSignOut={signOut} onNavigate={setPage} />}
      {page === 'events' && <Events onBack={() => setPage('dashboard')} />}
      {page === 'groups' && <Groups onBack={() => setPage('dashboard')} user={user} />}
      {page === 'connections' && <Connection onBack={() => setPage('dashboard')} user={user} />}
      {page === 'lostfound' && <LostFound onBack={() => setPage('dashboard')} />}
      {page === 'profile' && <ProfilePage user={user} onBack={() => setPage('dashboard')} onSignOut={signOut} onUpdateUser={(updatedUser) => { setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser)); }} />}
    </ThemeProvider>
  )
}

export default App
