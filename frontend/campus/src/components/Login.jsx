import React, { useState } from 'react'

const Login = ({ onAuth, switchToSignup }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onAuth && onAuth({ email })
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
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
          <button type="submit" className="btn-gradient" style={{ flex: 1 }}>Sign in</button>
          <button type="button" onClick={switchToSignup} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--accent-violet)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
