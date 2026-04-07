import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { GoogleLogin } from '@react-oauth/google'
import { authAPI } from '../services/api'
import { setUser } from '../store/authSlice'

const Signup = ({ switchToLogin }) => {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
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
      const response = await authAPI.signup(name, email, password)
      dispatch(setUser({ user: response.user, token: response.token }))
    } catch (err) {
      setError(err.message)
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    setError('')
    try {
      const response = await authAPI.googleLogin(credentialResponse.credential)
      dispatch(setUser({ user: response.user, token: response.token }))
    } catch (err) {
      setError(err.message)
      console.error('Google signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-up was cancelled or failed. Please try again.')
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label className="form-label">Full name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="John Doe"
            className="glass-input"
            disabled={loading}
          />
        </div>

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
            className="btn-gradient btn-gradient-green" 
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <button 
            type="button" 
            onClick={switchToLogin} 
            style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--accent-emerald)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            disabled={loading}
          >
            Sign in →
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="divider" style={{ margin: '1.5rem 0' }}>or sign up with</div>

      {/* Google Sign-Up Button */}
      <div className="google-btn-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="filled_black"
          shape="pill"
          size="large"
          width="100%"
          text="signup_with"
          logo_alignment="center"
        />
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '1rem 0 0' }}>By creating an account you agree to our terms and privacy policy.</p>
    </div>
  )
}

export default Signup
