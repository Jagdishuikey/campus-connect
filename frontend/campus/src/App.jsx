
import React, {useState} from 'react'
import './App.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Events from './pages/Events'
import Groups from './pages/Groups'
import Connection from './pages/Connection'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')

  const handleAuth = (u) => {
    setUser(u)
    setPage('dashboard')
  }
  const signOut = () => setUser(null)

  if (!user) return <Auth onAuth={handleAuth} />

  return (
    <>
      {page === 'dashboard' && <Dashboard user={user} onSignOut={signOut} onNavigate={setPage} />}
      {page === 'events' && <Events onBack={() => setPage('dashboard')} />}
      {page === 'groups' && <Groups onBack={() => setPage('dashboard')} />}
      {page === 'connections' && <Connection onBack={() => setPage('dashboard')} />}
    </>
  )
}

export default App
