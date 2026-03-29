import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { authAPI } from '../services/api'
import { setUser } from '../store/authSlice'

const Login = ({ switchToSignup }) => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="glass-input"
              style={{ width: '100%', paddingRight: '2.5rem' }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '1rem',
                padding: 0,
                lineHeight: 1,
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
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
      </form>
    </div>
  )
}

export default Login
