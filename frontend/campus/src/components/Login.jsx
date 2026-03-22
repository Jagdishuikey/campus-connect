import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { authAPI } from '../services/api'
import { setUser } from '../store/authSlice'

const Login = ({ switchToSignup }) => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(email, password)
      
      // Dispatch to Redux store (persists to localStorage inside reducer)
      dispatch(setUser({ user: response.user, token: response.token }))
    } catch (err) {
      setError(err.message)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@university.edu"
            className="glass-input"
            disabled={loading}
          />
        </div>

        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="glass-input"
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
          <button 
            type="submit" 
            className="btn-gradient" 
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button 
            type="button" 
            onClick={switchToSignup} 
            style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--accent-violet)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            disabled={loading}
          >
            Create account →
          </button>
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '0.25rem 0' }}>Or continue with</div>

        {/* Social Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button type="button" className="btn-ghost" style={{ justifyContent: 'center' }}>
            <span></span> Apple
          </button>
          <button type="button" className="btn-ghost" style={{ justifyContent: 'center' }}>
            <span>G</span> Google
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
