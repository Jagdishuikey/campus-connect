
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'
import { ThemeProvider } from './components/ThemeContext'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Events from './pages/Events'
import Groups from './pages/Groups'
import Connection from './pages/Connection'
import LostFound from './pages/LostFound'
import ProfilePage from './pages/ProfilePage'
import Hostels from './pages/Hostels'
import { connectSocket, getSocket } from './services/socket'

function App() {
  const user = useSelector(state => state.auth.user)
  const page = useSelector(state => state.ui.page)
  const dispatch = useDispatch()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Auto-connect socket when user is logged in
  useEffect(() => {
    if (user) {
      const userId = user.id || user._id
      if (userId) connectSocket(userId)
    }
  }, [user])

  // Global notification listener for incoming messages
  useEffect(() => {
    if (!user) return

    const socket = getSocket()

    const handleIncomingMessage = (message) => {
      const senderId = message.sender?._id || message.sender
      const currentUserId = user.id || user._id

      // Don't notify for own messages
      if (senderId === currentUserId) return

      const senderName = message.senderName || message.sender?.name || 'Someone'
      const content = message.content
        ? message.content.length > 50 ? message.content.slice(0, 50) + '…' : message.content
        : '📷 Sent an image'

      toast(
        (t) => (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => toast.dismiss(t.id)}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            }}>
              {senderName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1a1a2e' }}>{senderName}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{content}</div>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(139,92,246,0.15)',
          },
          icon: '💬',
        }
      )
    }

    socket.on('receive_message', handleIncomingMessage)

    return () => {
      socket.off('receive_message', handleIncomingMessage)
    }
  }, [user])

  if (!user) return (
    <ThemeProvider>
      <Toaster />
      <Auth />
    </ThemeProvider>
  )

  return (
    <ThemeProvider>
      <Toaster />
      <div className={`app-layout ${sidebarCollapsed ? 'has-sidebar-collapsed' : 'has-sidebar'}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
        <div className="app-main" key={page}>
          {page === 'dashboard' && <Dashboard />}
          {page === 'events' && <Events />}
          {page === 'groups' && <Groups />}
          {page === 'connections' && <Connection />}
          {page === 'chat' && <Connection initialTab="connections" />}
          {page === 'lostfound' && <LostFound />}
          {page === 'profile' && <ProfilePage />}
          {page === 'hostels' && <Hostels />}
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
