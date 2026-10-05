import { useState } from 'react'
import { unlock } from '../../lib/firebase.js'

function errorMessage(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-login-credentials':
      return 'Incorrect password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Unable to unlock. Please try again.'
  }
}

export default function UnlockScreen() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError('')
    try {
      await unlock(password)
      // On success the auth listener swaps this screen for the Planner.
    } catch (err) {
      setError(errorMessage(err.code))
      setPassword('')
      setBusy(false)
    }
  }

  return (
    <main className="pl-unlock">
      <form className="pl-unlock-card" onSubmit={handleSubmit}>
        <h1>Private Planner</h1>

        {/* Lets password managers / iCloud Keychain match the saved login */}
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={import.meta.env.VITE_PLANNER_EMAIL}
          readOnly
          hidden
        />

        <label htmlFor="pl-password">Password</label>
        <input
          id="pl-password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'pl-error' : undefined}
          autoFocus
          required
        />

        {error && (
          <p id="pl-error" className="pl-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="pl-btn pl-btn-primary" disabled={busy || !password}>
          {busy ? 'Unlocking…' : 'Unlock'}
        </button>
      </form>
    </main>
  )
}
