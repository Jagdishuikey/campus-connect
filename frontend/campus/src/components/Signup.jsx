import React, { useState } from 'react'

const Signup = ({ onAuth, switchToLogin }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    onAuth && onAuth({ name, email })
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
          <button type="submit" className="btn-gradient btn-gradient-green" style={{ flex: 1 }}>Create account</button>
          <button type="button" onClick={switchToLogin} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: 'var(--accent-emerald)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Sign in →
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>By creating an account you agree to our terms and privacy policy.</p>
      </form>
    </div>
  )
}

export default Signup
