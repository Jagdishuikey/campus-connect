
import React, { useState } from 'react'
import './App.css'
import { ThemeProvider } from './components/ThemeContext'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Events from './pages/Events'
import Groups from './pages/Groups'
import Connection from './pages/Connection'
import LostFound from './pages/LostFound'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')

  const handleAuth = (u) => {
    setUser(u)
    setPage('dashboard')
  }
  const signOut = () => setUser(null)

  if (!user) return (
    <ThemeProvider>
      <Auth onAuth={handleAuth} />
    </ThemeProvider>
  )

  return (
    <ThemeProvider>
      {page === 'dashboard' && <Dashboard user={user} onSignOut={signOut} onNavigate={setPage} />}
      {page === 'events' && <Events onBack={() => setPage('dashboard')} />}
      {page === 'groups' && <Groups onBack={() => setPage('dashboard')} />}
      {page === 'connections' && <Connection onBack={() => setPage('dashboard')} />}
      {page === 'lostfound' && <LostFound onBack={() => setPage('dashboard')} />}
    </ThemeProvider>
  )
}

export default App
